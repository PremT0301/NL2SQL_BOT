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
        private readonly ChatHistoryService _chatHistory;

        public ChatController(QueryProcessorService queryProcessor, ChatHistoryService chatHistory)
        {
            _queryProcessor = queryProcessor;
            _chatHistory = chatHistory;
        }

        // GET: api/chat/conversations
        [HttpGet("conversations")]
        public IActionResult GetConversations()
        {
            var conversations = _chatHistory.GetConversations();
            return Ok(conversations);
        }

        // GET: api/chat/{id}
        [HttpGet("{id}")]
        public IActionResult GetConversation(string id)
        {
            var messages = _chatHistory.GetMessages(id);
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
                // 1. Determine Conversation ID or Create New
                string? conversationId = request.ConversationId;
                if (string.IsNullOrEmpty(conversationId))
                {
                    var newConvo = _chatHistory.CreateConversation("New Chat");
                    conversationId = newConvo.Id;
                }

                // 2. Save User Message
                _chatHistory.AddMessage(conversationId, new ChatMessage
                {
                    Sender = "user",
                    Text = request.Message,
                    Timestamp = DateTime.UtcNow.ToString("o")
                });

                // 3. Process with LLM
                var result = await _queryProcessor.ProcessQueryAsync(request.Message, request.DatasetId);

                // 4. Save Bot Message
                _chatHistory.AddMessage(conversationId, new ChatMessage
                {
                    Sender = "bot",
                    Text = result.Reply,
                    Emotion = result.Emotion,
                    Intent = result.Intent,
                    Sql = result.Sql,
                    Data = result.Data,
                    Timestamp = DateTime.UtcNow.ToString("o")
                });

                return Ok(new
                {
                    reply = result.Reply,
                    emotion = result.Emotion,
                    intent = result.Intent,
                    sql = result.Sql,
                    data = result.Data,
                    conversationId = conversationId
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
        public string? DatasetId { get; set; }
    }
}
