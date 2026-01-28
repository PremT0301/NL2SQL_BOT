using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using InventoryChatbot.Api.Services;
using InventoryChatbot.Api.Models;

namespace InventoryChatbot.Api.Controllers
{
    [ApiController]
    [Route("api/chat")]
    public class ChatController : ControllerBase
    {
        private readonly QueryProcessorService _queryProcessor;

        public ChatController(QueryProcessorService queryProcessor)
        {
            _queryProcessor = queryProcessor;
        }

        // GET: api/chat/conversations
        [HttpGet("conversations")]
        public IActionResult GetConversations()
        {
            // TODO: In a real app, fetch from database based on User ID
            // var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // Mock Data
            var summaries = new[]
            {
                new { id = "1", title = "Inventory Status", lastMessageAt = DateTime.UtcNow.ToString("o") },
                new { id = "2", title = "Supplier Check", lastMessageAt = DateTime.UtcNow.AddDays(-1).ToString("o") }
            };
            return Ok(summaries);
        }

        // GET: api/chat/{id}
        [HttpGet("{id}")]
        public IActionResult GetConversation(string id)
        {
            // Mock Data
            var messages = new[]
            {
                new { sender = "user", text = "How many laptops do we have?", timestamp = DateTime.UtcNow.AddMinutes(-10).ToString("o") },
                new { sender = "bot", text = "We have 45 laptops in stock.", timestamp = DateTime.UtcNow.AddMinutes(-9).ToString("o") }
            };
            return Ok(messages);
        }

        // POST: api/chat/message
        [HttpPost("message")]
        public async Task<IActionResult> SendMessage([FromBody] ChatMessageRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Message))
                return BadRequest("Message cannot be empty");

            try
            {
                var result = await _queryProcessor.ProcessQueryAsync(request.Message);

                return Ok(new
                {
                    reply = result.Reply,
                    emotion = result.Emotion,
                    intent = result.Intent,
                    data = result.Data,
                    conversationId = request.ConversationId ?? Guid.NewGuid().ToString() // Return same or new ID
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }

    public class ChatMessageRequest
    {
        public string Message { get; set; } = string.Empty;
        public string? ConversationId { get; set; }
    }
}
