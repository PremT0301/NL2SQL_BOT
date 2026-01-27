using System.Data;
using Dapper;
using InventoryChatbot.Api.Models;

namespace InventoryChatbot.Api.Data
{
    public class DbInitializer
    {
        private readonly InventoryRepository _repository;

        public DbInitializer(InventoryRepository repository)
        {
            _repository = repository;
        }

        public async Task InitializeAsync()
        {
            // Ensure Users table exists
            var createTableSql = @"
                CREATE TABLE IF NOT EXISTS Users (
                    Id INT AUTO_INCREMENT PRIMARY KEY,
                    Email VARCHAR(255) NOT NULL UNIQUE,
                    PasswordHash VARCHAR(255) NOT NULL,
                    Role VARCHAR(50) NOT NULL,
                    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
                );";

            await _repository.ExecuteSafeQueryAsync(createTableSql);

            // Seed Admin User if not exists
            var adminEmail = "admin@company.com";
            var existingAdmin = await _repository.GetUserByEmailAsync(adminEmail);

            if (existingAdmin == null)
            {
                var adminUser = new User
                {
                    Email = adminEmail,
                    // Default password: AdminPass123!
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("AdminPass123!"),
                    Role = "ADMIN",
                    CreatedAt = DateTime.UtcNow
                };
                await _repository.CreateUserAsync(adminUser);
            }
        }
    }
}
