using InventoryChatbot.Api.Data;
using InventoryChatbot.Api.Models;

namespace InventoryChatbot.Api.Services;

public class QueryProcessorService
{
    private readonly LlmService _llmService;
    private readonly SqlGuardService _sqlGuardService;
    private readonly InventoryRepository _repository;
    private readonly ILogger<QueryProcessorService> _logger;

    public QueryProcessorService(
        LlmService llmService,
        SqlGuardService sqlGuardService,
        InventoryRepository repository,
        ILogger<QueryProcessorService> logger)
    {
        _llmService = llmService;
        _sqlGuardService = sqlGuardService;
        _repository = repository;
        _logger = logger;
    }

    public async Task<QueryResponse> ProcessQueryAsync(string userMessage)
    {
        // 1. Call LLM
        LlmResponse llmResult;
        try
        {
            llmResult = await _llmService.GenerateSqlAsync(userMessage);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "LLM Service failed.");
            return new QueryResponse
            {
                Reply = "I'm having trouble understanding that right now. Please try again.",
                Emotion = "neutral", // Default fallback
                Intent = "UNKNOWN"
            };
        }

        // 2. If no SQL generated (e.g. conversational), return immediately
        if (string.IsNullOrWhiteSpace(llmResult.Sql) || llmResult.Sql.Trim() == "SELECT ..." || llmResult.Sql.Trim() == "SELECT")
        {
            return new QueryResponse
            {
                Reply = llmResult.Reply,
                Emotion = llmResult.Emotion,
                Intent = llmResult.Intent,
                Data = new List<dynamic>()
            };
        }

        // 3. Guard SQL
        string safeSql;
        try
        {
            safeSql = _sqlGuardService.ValidateAndSanitize(llmResult.Sql);
        }
        catch (SecurityException ex)
        {
            _logger.LogWarning(ex, "SQL Guard blocked unsafe query: {Sql}", llmResult.Sql);
            return new QueryResponse
            {
                Reply = "I cannot execute that request safely. " + ex.Message,
                Emotion = "urgent", // Alerting user
                Intent = llmResult.Intent
            };
        }

        // 4. Execute SQL
        IEnumerable<dynamic> data;
        try
        {
            data = await _repository.ExecuteSafeQueryAsync(safeSql);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Database execution failed. SQL: {Sql}", safeSql);
            return new QueryResponse
            {
                Reply = "I encountered a database issue while looking that up.",
                Emotion = "frustrated",
                Intent = llmResult.Intent
            };
        }

        // 5. Build Final Response
        return new QueryResponse
        {
            Reply = llmResult.Reply,
            Emotion = llmResult.Emotion,
            Intent = llmResult.Intent,
            Data = data
        };
    }
}
