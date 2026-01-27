using InventoryChatbot.Api.Models;
using InventoryChatbot.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace InventoryChatbot.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class QueryController : ControllerBase
{
    private readonly QueryProcessorService _queryProcessor;

    public QueryController(QueryProcessorService queryProcessor)
    {
        _queryProcessor = queryProcessor;
    }

    [HttpPost]
    public async Task<ActionResult<QueryResponse>> ProcessQuery([FromBody] QueryRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
        {
            return BadRequest(new { error = "Message cannot be empty." });
        }

        var response = await _queryProcessor.ProcessQueryAsync(request.Message);
        return Ok(response);
    }
}
