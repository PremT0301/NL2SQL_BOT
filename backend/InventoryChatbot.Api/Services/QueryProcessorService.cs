using InventoryChatbot.Api.Data;
using InventoryChatbot.Api.Models;

namespace InventoryChatbot.Api.Services;

public class QueryProcessorService
{
    private readonly LlmService _llmService;
    private readonly SqlGuardService _sqlGuardService;
    private readonly InventoryRepository _repository;
    private readonly MetricsService _metrics;
    private readonly ILogger<QueryProcessorService> _logger;

    public QueryProcessorService(
        LlmService llmService,
        SqlGuardService sqlGuardService,
        InventoryRepository repository,
        MetricsService metrics,
        ILogger<QueryProcessorService> logger)
    {
        _llmService = llmService;
        _sqlGuardService = sqlGuardService;
        _repository = repository;
        _metrics = metrics;
        _logger = logger;
    }

    public async Task<QueryResponse> ProcessQueryAsync(string userMessage)
    {
        _metrics.Increment("total_requests");
        var startTime = DateTime.UtcNow;

        // 1. Call LLM
        LlmResponse llmResult;
        var llmStart = DateTime.UtcNow;
        try
        {
            llmResult = await _llmService.GenerateSqlAsync(userMessage);
            var llmLatency = (DateTime.UtcNow - llmStart).TotalMilliseconds;

            _metrics.RecordLatency("llm_latency", llmLatency);
            Console.WriteLine($"DEBUG: LLM Generated SQL: {llmResult.Sql}");
            _logger.LogInformation("LLM Decision: Intent={Intent}, Emotion={Emotion}, Latency={Latency}ms",
                llmResult.Intent, llmResult.Emotion, llmLatency);
        }
        catch (Exception ex)
        {
            _metrics.Increment("llm_failures");
            _logger.LogError(ex, "LLM Service failed.");
            return new QueryResponse
            {
                Reply = "I'm having trouble understanding that right now. Please try again.",
                Emotion = "neutral",
                Intent = "UNKNOWN"
            };
        }

        // 2. If no SQL generated (conversational) or GREETING, return immediately
        if (string.IsNullOrWhiteSpace(llmResult.Sql)
            || llmResult.Sql.Trim().ToUpper() == "NO_SQL"
            || llmResult.Intent == "GREETING"
            || llmResult.Sql.Trim() == "SELECT ..."
            || llmResult.Sql.Trim() == "SELECT")
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
            _metrics.Increment("guardrail_rejections");
            _logger.LogWarning("SQL Guard blocked unsafe query. Reason: {Reason}", ex.Message);

            await _repository.LogQueryAsync(new QueryLog
            {
                QueryText = userMessage,
                Intent = llmResult.Intent,
                IsRejected = true,
                RejectionReason = ex.Message,
                Timestamp = DateTime.UtcNow
            });

            return new QueryResponse
            {
                Reply = "I cannot execute that request safely. " + ex.Message,
                Emotion = "urgent",
                Intent = llmResult.Intent
            };
        }

        // 4. Execute SQL
        IEnumerable<dynamic> data;
        var sqlHash = safeSql.HashSql();
        var sqlStart = DateTime.UtcNow;
        try
        {
            data = await _repository.ExecuteSafeQueryAsync(safeSql);
            var sqlLatency = (DateTime.UtcNow - sqlStart).TotalMilliseconds;
            var rowCount = data.Count();

            _metrics.Increment("successful_queries");
            _logger.LogInformation("SQL Executed: Hash={SqlHash}, Rows={RowCount}, Latency={Latency}ms",
                sqlHash, rowCount, sqlLatency);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Database execution failed. RequestHash={SqlHash}", sqlHash);
            return new QueryResponse
            {
                Reply = "I encountered a database issue while looking that up.",
                Emotion = "frustrated",
                Intent = llmResult.Intent
            };
        }

        // 5. Build Final Response
        var queryLog = new QueryLog
        {
            QueryText = userMessage,
            Intent = llmResult.Intent,
            IsRejected = false,
            RejectionReason = null,
            Timestamp = DateTime.UtcNow
        };
        await _repository.LogQueryAsync(queryLog);

        return new QueryResponse
        {
            Reply = llmResult.Reply,
            Emotion = llmResult.Emotion,
            Intent = llmResult.Intent,
            Data = data
        };
    }
}
