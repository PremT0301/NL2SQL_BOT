using Dapper;
using MySql.Data.MySqlClient;
using System.Data;

namespace InventoryChatbot.Api.Data;

public class InventoryRepository
{
    private readonly string _connectionString;

    public InventoryRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new ArgumentNullException("Connection string 'DefaultConnection' not found.");
    }

    private IDbConnection CreateConnection()
    {
        return new MySqlConnection(_connectionString);
    }

    public async Task<IEnumerable<dynamic>> ExecuteSafeQueryAsync(string sql)
    {
        using var connection = CreateConnection();
        // Dapper returns IEnumerable<dynamic> by default for strict string queries
        return await connection.QueryAsync(sql);
    }

    public async Task<bool> TestConnectionAsync()
    {
        using var connection = CreateConnection();
        connection.Open(); // Will throw if invalid
        var result = await connection.ExecuteScalarAsync<int>("SELECT 1");
        return result == 1;
    }
}
