namespace InventoryChatbot.Api.Models;

public class QueryResponse
{
    public string Reply { get; set; } = string.Empty;
    public string Emotion { get; set; } = "neutral";
    public string Intent { get; set; } = "UNKNOWN";
    public string? Sql { get; set; }
    public IEnumerable<dynamic> Data { get; set; } = new List<dynamic>();
}
