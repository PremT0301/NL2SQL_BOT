using System.Text;
using InventoryChatbot.Api.Models;
using Newtonsoft.Json;

namespace InventoryChatbot.Api.Services;

public class LlmService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _model;

    public LlmService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _apiKey = configuration["LlmSettings:ApiKey"] ?? throw new ArgumentNullException("LlmSettings:ApiKey is missing.");
        _model = configuration["LlmSettings:Model"] ?? "gpt-4o";

        var baseUrl = configuration["LlmSettings:BaseUrl"] ?? "https://api.openai.com/v1";
        if (!baseUrl.EndsWith("/"))
        {
            baseUrl += "/";
        }
        _httpClient.BaseAddress = new Uri(baseUrl);
    }

    public async Task<LlmResponse> GenerateSqlAsync(string userMessage)
    {
        var systemPrompt = @"
You are a SQL Expert for an Inventory Database.
Schema:
- Products(ProductId, Name, Category, StockQty, Price)
- Suppliers(SupplierId, Name, Contact)
- Orders(OrderId, ProductId, Quantity, OrderDate)

Your Job:
1. Analyze the user's natural language request.
2. Determine the INTENT: CHECK_STOCK | LOW_STOCK | ORDER_SUMMARY | SUPPLIER_INFO | UNKNOWN.
3. Determine the EMOTION of the user: neutral | frustrated | urgent | happy.
4. Generate a SAFE MySQL SELECT query.
   - ONLY SELECT is allowed.
   - NO INSERT/UPDATE/DELETE/DROP.
   - If the request is not related to the database, return SQL as empty string.
5. Provide a friendly conversational REPLY.

Output STRICT JSON only:
{
  ""intent"": ""..."",
  ""emotion"": ""..."",
  ""sql"": ""..."",
  ""reply"": ""...""
}
";

        var requestBody = new
        {
            model = _model,
            messages = new[]
            {
                new { role = "system", content = systemPrompt },
                new { role = "user", content = userMessage }
            },
            temperature = 0,
            max_tokens = 500 // Limit token usage to prevent huge credit hold
        };

        var jsonContent = JsonConvert.SerializeObject(requestBody);
        var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

        _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _apiKey);

        // OpenRouter recommended headers
        if (_httpClient.BaseAddress?.Host.Contains("openrouter.ai") == true)
        {
            _httpClient.DefaultRequestHeaders.Add("HTTP-Referer", "http://localhost:5000"); // Site URL
            _httpClient.DefaultRequestHeaders.Add("X-Title", "Inventory Chatbot"); // App Name
        }

        var response = await _httpClient.PostAsync("chat/completions", content); // Assumes BaseUrl ends with /v1/ or similar, but standard usage involves /v1/chat/completions. 
                                                                                 // Adjustment: if BaseUrl is https://api.openai.com/v1, then appending "chat/completions" works.

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            throw new Exception($"LLM API Error: {response.StatusCode} - {error}");
        }

        var resString = await response.Content.ReadAsStringAsync();

        // Parse OpenAI response structure
        dynamic? openAiRes = JsonConvert.DeserializeObject(resString);
        string? contentStr = openAiRes?.choices?[0]?.message?.content;

        if (string.IsNullOrEmpty(contentStr))
        {
            throw new Exception("LLM returned empty content.");
        }

        // Clean content if it contains markdown code blocks
        contentStr = contentStr.Replace("```json", "").Replace("```", "").Trim();

        try
        {
            var llmResponse = JsonConvert.DeserializeObject<LlmResponse>(contentStr);
            if (llmResponse == null) throw new Exception("Failed to deserialize LLM JSON.");
            return llmResponse;
        }
        catch (JsonException)
        {
            // Fallback if LLM outputs bad JSON
            throw new Exception($"LLM did not return valid JSON: {contentStr}");
        }
    }
}
