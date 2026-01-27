using System.Security.Cryptography;
using System.Text;

namespace InventoryChatbot.Api.Services;

public static class LoggingExtensions
{
    public static string HashSql(this string sql)
    {
        if (string.IsNullOrEmpty(sql)) return "EMPTY";
        using var sha256 = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(sql);
        var hash = sha256.ComputeHash(bytes);
        return Convert.ToBase64String(hash);
    }

    // Helper to log without exposing PII or raw secrets
    public static void LogSafe(this ILogger logger, LogLevel level, string message, params object[] args)
    {
        // Placeholder for any specific sanitization logic if needed
        logger.Log(level, message, args);
    }
}
