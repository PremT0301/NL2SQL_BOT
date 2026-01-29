using System;
using System.Linq;
using System.Collections.Concurrent;
using InventoryChatbot.Api.Models;

namespace InventoryChatbot.Api.Services;

public class ChatHistoryService
{
    // In-memory storage: ConversationId -> List of Messages
    private readonly ConcurrentDictionary<string, List<ChatMessage>> _messages = new();

    // In-memory storage: ConversationId -> Summary
    private readonly ConcurrentDictionary<string, ConversationSummaryModel> _conversations = new();

    public IEnumerable<ConversationSummaryModel> GetConversations()
    {
        return _conversations.Values.OrderByDescending(c => c.LastMessageAt);
    }

    public IEnumerable<ChatMessage> GetMessages(string conversationId)
    {
        if (_messages.TryGetValue(conversationId, out var messages))
        {
            return messages;
        }
        return Enumerable.Empty<ChatMessage>();
    }

    public ConversationSummaryModel CreateConversation(string title)
    {
        var id = Guid.NewGuid().ToString();
        var summary = new ConversationSummaryModel
        {
            Id = id,
            Title = title,
            LastMessageAt = DateTime.UtcNow
        };

        _conversations.TryAdd(id, summary);
        _messages.TryAdd(id, new List<ChatMessage>());

        return summary;
    }

    public void AddMessage(string conversationId, ChatMessage message)
    {
        // Ensure conversation exists
        if (!_conversations.ContainsKey(conversationId))
        {
            CreateConversation("New Chat"); // Fallback if ID provided but not found
        }

        // Add message
        _messages.AddOrUpdate(conversationId,
            new List<ChatMessage> { message },
            (key, list) => { list.Add(message); return list; });

        // Update last message time
        if (_conversations.TryGetValue(conversationId, out var summary))
        {
            summary.LastMessageAt = DateTime.UtcNow;
            // Optionally update title based on first message
            if (summary.Title == "New Chat" && message.Sender == "user")
            {
                summary.Title = message.Text.Length > 30 ? message.Text.Substring(0, 30) + "..." : message.Text;
            }
        }
    }
}

public class ConversationSummaryModel
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public DateTime LastMessageAt { get; set; }
}

// Ensure ChatMessage model exists or reuse from established models
public class ChatMessage
{
    public string Sender { get; set; } = "";
    public string Text { get; set; } = "";
    public string Emotion { get; set; } = "neutral";
    public string? Intent { get; set; }
    public string? Sql { get; set; }
    public IEnumerable<dynamic>? Data { get; set; }
    public string Timestamp { get; set; } = "";
}
