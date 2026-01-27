using System.Collections.Concurrent;

namespace InventoryChatbot.Api.Services;

public class MetricsService
{
    private readonly ConcurrentDictionary<string, long> _counters = new();
    private readonly ConcurrentDictionary<string, List<double>> _latencies = new();

    public void Increment(string metricName)
    {
        _counters.AddOrUpdate(metricName, 1, (_, count) => count + 1);
    }

    public void RecordLatency(string metricName, double ms)
    {
        // For production, use Histogram or specialized TSDB (e.g. Prometheus)
        // keeping simple in-memory thread-safe list for this requirement
        _latencies.AddOrUpdate(metricName,
            new List<double> { ms },
            (_, list) =>
            {
                lock (list) // simple lock for internal list safety
                {
                    list.Add(ms);
                    if (list.Count > 1000) list.RemoveAt(0); // keep rolling window
                }
                return list;
            });
    }

    public IDictionary<string, long> GetCounters() => new Dictionary<string, long>(_counters);

    public double GetAverageLatency(string metricName)
    {
        if (_latencies.TryGetValue(metricName, out var list))
        {
            lock (list)
            {
                if (list.Count == 0) return 0;
                return list.Average();
            }
        }
        return 0;
    }
}
