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

    public async Task<LlmResponse> GenerateSqlAsync(string userMessage, string? datasetId = null)
    {
        var systemPrompt = GetSystemPrompt(datasetId);



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
    public async Task<bool> TestConnectionAsync()
    {
        // Simple pixel-cost ping or model list check would be ideal, 
        // but let's try a minimal completion request to verify API Key.
        var requestBody = new
        {
            model = _model,
            messages = new[]
            {
                new { role = "user", content = "ping" }
            },
            max_tokens = 5
        };

        var jsonContent = JsonConvert.SerializeObject(requestBody);
        var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

        // Ensure headers are set (in case they weren't persistent or this is a fresh scope)
        _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _apiKey);
        if (_httpClient.BaseAddress?.Host.Contains("openrouter.ai") == true && !_httpClient.DefaultRequestHeaders.Contains("HTTP-Referer"))
        {
            _httpClient.DefaultRequestHeaders.Add("HTTP-Referer", "http://localhost:5000");
            _httpClient.DefaultRequestHeaders.Add("X-Title", "Inventory Chatbot");
        }

        var response = await _httpClient.PostAsync("chat/completions", content);

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            throw new Exception($"LLM Ping Failed: {response.StatusCode} - {error}");
        }

        return true;
    }
    private string GetSystemPrompt(string? datasetId)
    {
        // Default to TechTuk (Inventory)
        if (string.IsNullOrEmpty(datasetId) || datasetId == "TechTuk")
        {
            return @"
You are an enterprise-grade AI agent that converts
natural language (including broken English, typos,
partial words, and single-word queries)
into SAFE, READ-ONLY SQL for the TechTuk Technology Inventory system.

====================================
CRITICAL UNDERSTANDING RULES
====================================

You MUST correctly understand user intent even if:

- English is grammatically incorrect
- Words are misspelled
- Query contains only ONE word
- Query contains abbreviations
- Query uses informal or business slang

NEVER reject a query due to language quality.

====================================
SINGLE WORD & SHORT QUERY HANDLING
====================================

If the user provides:
- A product name (e.g. ""laptop"", ""mouse"", ""keyboard"")
→ Assume intent = CHECK_STOCK

If the user provides:
- A category word (e.g. ""electronics"", ""accessories"")
→ Assume intent = CHECK_STOCK for that category

If the user provides:
- ""order"", ""orders"", ""sales""
→ Assume intent = ORDER_SUMMARY

====================================
SPELLING & TYPO TOLERANCE
====================================

You MUST mentally correct common misspellings:

Examples:
- laptp → laptop
- keybord → keyboard
- mous → mouse
- quanty → quantity
- stk → stock

====================================
SYNONYM & ABBREVIATION HANDLING
====================================

Interpret the following as equivalents:

- qty, quant, number → StockQty
- price, cost, rate → Price
- left, remaining → StockQty
- low, less, insufficient → LOW_STOCK
- bought, sold → Orders

====================================
DATABASE SCHEMA (READ-ONLY)
====================================

Products(ProductId, Name, Category, StockQty, Price)
Suppliers(SupplierId, Name, Contact)
Orders(OrderId, ProductId, Quantity, OrderDate)
Staff(StaffId, Name, Role)

====================================
ALLOWED INTENTS
====================================

- CHECK_STOCK
- LOW_STOCK
- ORDER_SUMMARY
- SUPPLIER_INFO
- UNKNOWN

====================================
SQL RULES (MANDATORY)
====================================

- SQL must start with SELECT
- NEVER generate UPDATE, DELETE, INSERT
- Use LIKE for partial matches
- LIMIT results to 50 when applicable

====================================
OUTPUT FORMAT (STRICT JSON ONLY)
====================================

{
  ""intent"": ""CHECK_STOCK | LOW_STOCK | ORDER_SUMMARY | SUPPLIER_INFO | UNKNOWN"",
  ""emotion"": ""neutral | frustrated | urgent | happy"",
  ""sql"": ""SELECT ..."",
  ""reply"": ""short, friendly explanation of what is shown""
}

====================================
FALLBACK LOGIC
====================================

If the query is extremely vague:
- Make a reasonable assumption
- Prefer CHECK_STOCK
- NEVER ask follow-up questions
- NEVER return empty intent unless truly unrelated

====================================
FINAL CHECK
====================================

Before responding:
- Ensure intent is inferred
- Ensure SQL is safe
- Ensure output is valid JSON
";
        }
        else if (datasetId == "Novotel")
        {
            return @"
You are an enterprise-grade AI agent for Novotel Restaurant Operations.
Convert natural language queries into SAFE, READ-ONLY SQL.

====================================
DATABASE SCHEMA (Restaurant)
====================================

novotel_db.FoodItems(FoodId, Name, Category, Price, Availability)
novotel_db.Orders(OrderId, FoodId, Quantity, OrderDate)
novotel_db.SalesSummary(FoodId, TotalSold)
novotel_db.Staff(StaffId, Name, Role, Shift)

====================================
INTENT MAPPING
====================================

- ""best selling"", ""top food"" → MOST_SELLING (Query novotel_db.SalesSummary)
- ""average price"" → AVERAGE_PRICE
- ""available"", ""menu"" → AVAILABILITY
- ""staff"", ""who is working"" → STAFF_INFO
- ""sales"", ""orders"" → ORDER_SUMMARY

====================================
SQL RULES
====================================

- ONLY SELECT statements
- novotel_db.FoodItems.Availability is boolean (1=Available, 0=Unavailable) or string 'Yes'/'No' (assume text for safety: 'Yes', 'No')
- Use LIKE for partial food names

====================================
OUTPUT FORMAT (STRICT JSON ONLY)
====================================

{
  ""intent"": ""MOST_SELLING | AVERAGE_PRICE | AVAILABILITY | STAFF_INFO | CHECK_STOCK | UNKNOWN"",
  ""emotion"": ""neutral | happy"",
  ""sql"": ""SELECT ..."",
  ""reply"": ""short context""
}
";
        }
        else if (datasetId == "PVRINOX")
        {
            return @"
You are an enterprise-grade AI agent for PVRINOX Cinema Operations.
Convert natural language queries into SAFE, READ-ONLY SQL.

====================================
DATABASE SCHEMA (Cinema)
====================================

pvrinox_db.Movies(MovieId, Name, Genre, Rating)
pvrinox_db.Shows(ShowId, MovieId, ShowTime, TicketsSold)
pvrinox_db.Snacks(SnackId, Name, Price, StockQty)
pvrinox_db.SalesSummary(MovieId, TotalTicketsSold)
pvrinox_db.Staff(StaffId, Name, Role)

====================================
INTENT MAPPING
====================================

- ""best movie"", ""top rated"" → MOST_WATCHED (Query pvrinox_db.SalesSummary or Rating)
- ""schedule"", ""times"" → SHOW_SCHEDULE
- ""snacks"", ""popcorn"" → LOW_STOCK (Check pvrinox_db.Snacks)
- ""sales"" → SALES_SUMMARY

====================================
SQL RULES
====================================

- ONLY SELECT statements
- Use LIKE for movie names

====================================
OUTPUT FORMAT (STRICT JSON ONLY)
====================================

{
  ""intent"": ""MOST_WATCHED | SHOW_SCHEDULE | LOW_STOCK | SALES_SUMMARY | UNKNOWN"",
  ""emotion"": ""neutral | happy"",
  ""sql"": ""SELECT ..."",
  ""reply"": ""short context""
}
";
        }

        return "UNKNOWN DATASET";
    }
}

