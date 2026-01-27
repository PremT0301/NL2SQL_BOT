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
        Console.WriteLine($"DEBUG: API Key Loaded. Length: {_apiKey.Length}");
        Console.WriteLine($"DEBUG: API Key Starts with quote: {_apiKey.StartsWith("\"")}");
        Console.WriteLine($"DEBUG: API Key Ends with quote: {_apiKey.EndsWith("\"")}");
    }

    public async Task<LlmResponse> GenerateSqlAsync(string userMessage)
    {
        var systemPrompt = @"
You are an enterprise-grade AI agent that converts natural language queries
into SAFE, READ-ONLY SQL for an inventory management system.

You MUST follow ALL rules strictly.

====================================
DATABASE SCHEMA (READ-ONLY)
====================================

Tables:

1. Products
   - ProductId (int)
   - Name (string)
   - Category (string)
   - StockQty (int)
   - Price (decimal)

2. Suppliers
   - SupplierId (int)
   - Name (string)
   - Contact (string)

3. Orders
   - OrderId (int)
   - ProductId (int)
   - Quantity (int)
   - OrderDate (date)

====================================
ALLOWED INTENTS (ENUM ONLY)
====================================

- CHECK_STOCK
- LOW_STOCK
- ORDER_SUMMARY
- SUPPLIER_INFO
- UNKNOWN

====================================
EMOTION CLASSIFICATION
====================================

Detect the user's emotional tone based on wording:

- frustrated -> complaints, anger, dissatisfaction
- urgent -> urgency, deadlines, warnings
- happy -> positive, appreciation
- neutral -> default when unclear

====================================
SQL GENERATION RULES (CRITICAL)
====================================

1. OUTPUT MUST BE VALID JSON ONLY
2. DO NOT include explanations, markdown, or comments
3. SQL MUST:
   - Start with SELECT
   - Be syntactically valid
   - Use ONLY the schema above
   - NEVER modify data
   - NEVER reference unknown tables or columns
4. NEVER generate:
   - INSERT, UPDATE, DELETE
   - DROP, ALTER, TRUNCATE
   - Stored procedures or functions
5. Use SIMPLE SQL only
6. LIMIT results when appropriate (use LIMIT 50)

====================================
OUTPUT FORMAT (STRICT)
====================================

Return EXACTLY this JSON structure:

{
  ""intent"": ""CHECK_STOCK | LOW_STOCK | ORDER_SUMMARY | SUPPLIER_INFO | UNKNOWN"",
  ""emotion"": ""neutral | frustrated | urgent | happy"",
  ""sql"": ""SELECT ..."",
  ""reply"": ""short, friendly, professional response for the user""
}

====================================
INTENT -> SQL MAPPING RULES
====================================

CHECK_STOCK:
- User asks stock quantity of a product
- SQL: SELECT Name, StockQty FROM Products WHERE Name LIKE '%<product>%'

LOW_STOCK:
- User asks about low or insufficient stock
- SQL: SELECT Name, StockQty FROM Products WHERE StockQty < 10

ORDER_SUMMARY:
- User asks about orders over time
- SQL: SELECT OrderId, ProductId, Quantity, OrderDate FROM Orders ORDER BY OrderDate DESC LIMIT 50

SUPPLIER_INFO:
- User asks supplier details
- SQL: SELECT SupplierId, Name, Contact FROM Suppliers

UNKNOWN:
- If intent is unclear or not supported
- SQL: SELECT 1
- Reply politely that the request is not supported

====================================
FAILURE HANDLING
====================================

If:
- User asks to modify data
- User asks for unsupported operation
- User asks unrelated questions

THEN:
- intent = UNKNOWN
- emotion = neutral
- sql = ""SELECT 1""
- reply = ""Sorry, I can help only with inventory-related read-only queries.""

====================================
FINAL CHECK (MANDATORY)
====================================

Before responding, verify:
- JSON is valid
- SQL is READ-ONLY
- Intent is from the allowed list
- Emotion is from the allowed list

DO NOT violate any rule above.
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
            File.AppendAllText("debug_llm_error.txt", $"Error: {response.StatusCode} - {error}\n");
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
