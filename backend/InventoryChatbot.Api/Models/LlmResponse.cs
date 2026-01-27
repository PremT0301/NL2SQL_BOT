using Newtonsoft.Json;

namespace InventoryChatbot.Api.Models;

public class LlmResponse
{
    [JsonProperty("intent")]
    public string Intent { get; set; } = "UNKNOWN";

    [JsonProperty("emotion")]
    public string Emotion { get; set; } = "neutral";

    [JsonProperty("sql")]
    public string Sql { get; set; } = string.Empty;

    [JsonProperty("reply")]
    public string Reply { get; set; } = string.Empty;
}
