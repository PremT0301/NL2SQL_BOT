using System;

namespace InventoryChatbot.Api.Models
{
    public class QueryLog
    {
        public int Id { get; set; }
        public required string QueryText { get; set; }
        public required string Intent { get; set; }
        public bool IsRejected { get; set; } // True if guardrail blocked it
        public string? RejectionReason { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
