using System.Diagnostics;

namespace InventoryChatbot.Api.Middleware;

public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // 1. Generate or retrieve Correlation ID
        var correlationId = Guid.NewGuid().ToString();
        if (context.Request.Headers.TryGetValue("X-Correlation-ID", out var headerCorrelationId))
        {
            correlationId = headerCorrelationId.ToString();
        }

        // Attach to context for downstream services to use
        context.Items["CorrelationId"] = correlationId;

        // 2. Start Timer
        var stopwatch = Stopwatch.StartNew();

        // 3. Log Request Start
        var method = context.Request.Method;
        var path = context.Request.Path;
        var ip = MaskIp(context.Connection.RemoteIpAddress?.ToString());

        using (_logger.BeginScope(new Dictionary<string, object>
        {
            ["CorrelationId"] = correlationId,
            ["ClientIP"] = ip
        }))
        {
            _logger.LogInformation("Incoming Request: {Method} {Path}", method, path);

            // 4. Proceed
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled Exception during request processing");
                throw; // Re-throw to let global handler catch it or bubble up
            }
            finally
            {
                stopwatch.Stop();
                var statusCode = context.Response.StatusCode;
                _logger.LogInformation("Request Completed: {StatusCode} in {ElapsedMilliseconds}ms",
                    statusCode, stopwatch.ElapsedMilliseconds);
            }
        }
    }

    private string MaskIp(string? ipAddress)
    {
        if (string.IsNullOrEmpty(ipAddress)) return "Unknown";
        if (ipAddress == "::1") return "Localhost";

        var parts = ipAddress.Split('.');
        if (parts.Length == 4)
        {
            // Mask last octet: 192.168.1.XXX
            return $"{parts[0]}.{parts[1]}.{parts[2]}.XXX";
        }

        // Simple IPv6 masking (keep first segment)
        var ipv6Parts = ipAddress.Split(':');
        if (ipv6Parts.Length > 1)
        {
            return $"{ipv6Parts[0]}:****:****:****";
        }

        return "Masked";
    }
}
