using InventoryChatbot.Api.Data;
using InventoryChatbot.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace InventoryChatbot.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly InventoryRepository _repository;
    private readonly LlmService _llmService;

    public HealthController(InventoryRepository repository, LlmService llmService)
    {
        _repository = repository;
        _llmService = llmService;
    }

    [HttpGet]
    public async Task<IActionResult> CheckHealth()
    {
        var status = new Dictionary<string, string>();
        bool isHealthy = true;

        // 1. Check Database
        try
        {
            bool dbConnected = await _repository.TestConnectionAsync();
            status.Add("Database", dbConnected ? "Connected" : "Failed (Connection returned false)");
            if (!dbConnected) isHealthy = false;
        }
        catch (Exception ex)
        {
            status.Add("Database", $"Error: {ex.Message}");
            isHealthy = false;
        }

        // 2. Check LLM
        try
        {
            bool llmConnected = await _llmService.TestConnectionAsync();
            status.Add("LLM", llmConnected ? "Connected" : "Failed (Test call returned false)");
            if (!llmConnected) isHealthy = false;
        }
        catch (Exception ex)
        {
            status.Add("LLM", $"Error: {ex.Message}");
            isHealthy = false;
        }

        if (isHealthy)
        {
            return Ok(new { Status = "Healthy", Checks = status });
        }
        else
        {
            return StatusCode(503, new { Status = "Unhealthy", Checks = status });
        }
    }
}
