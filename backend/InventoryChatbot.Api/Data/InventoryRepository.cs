using Dapper;
using MySql.Data.MySqlClient;
using System.Data;
using InventoryChatbot.Api.Models;

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

    public async Task<User?> GetUserByEmailAsync(string email)
    {
        using var connection = CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<User>("SELECT * FROM Users WHERE Email = @Email", new { Email = email });
    }

    public async Task<int> CreateUserAsync(User user)
    {
        using var connection = CreateConnection();
        // Return ID if needed, or just Execute
        var sql = "INSERT INTO Users (Email, PasswordHash, Role, CreatedAt) VALUES (@Email, @PasswordHash, @Role, @CreatedAt); SELECT LAST_INSERT_ID();";
        return await connection.ExecuteScalarAsync<int>(sql, user);
    }

    public async Task<IEnumerable<User>> GetAllUsersAsync()
    {
        using var connection = CreateConnection();
        return await connection.QueryAsync<User>("SELECT * FROM Users");
    }

    public async Task<bool> DeleteUserAsync(int id)
    {
        using var connection = CreateConnection();
        var rowsAffected = await connection.ExecuteAsync("DELETE FROM Users WHERE Id = @Id", new { Id = id });
        return rowsAffected > 0;
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
