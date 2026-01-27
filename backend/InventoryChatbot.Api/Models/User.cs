using System.Text.Json.Serialization;

namespace InventoryChatbot.Api.Models
{
    public class User
    {
        public int Id { get; set; }
        public required string Email { get; set; }
        [JsonIgnore]
        public required string PasswordHash { get; set; }
        public required string Role { get; set; } // "ADMIN" or "USER"
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class LoginRequest
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
    }

    public class RegisterRequest
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
        public string Role { get; set; } = "USER";
    }

    public class LoginResponse
    {
        public required string Token { get; set; }
        public required string Role { get; set; }
        public required string Username { get; set; }
    }
}
