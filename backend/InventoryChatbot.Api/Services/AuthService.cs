using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Dapper;
using InventoryChatbot.Api.Data;
using InventoryChatbot.Api.Models;
using Microsoft.IdentityModel.Tokens;

namespace InventoryChatbot.Api.Services
{
    using ModelUser = InventoryChatbot.Api.Models.User; // Explicit alias to avoid confusion

    public class AuthService
    {
        private readonly InventoryRepository _repository;
        private readonly IConfiguration _configuration;

        public AuthService(InventoryRepository repository, IConfiguration configuration)
        {
            _repository = repository;
            _configuration = configuration;
        }

        public async Task<ModelUser?> RegisterAsync(RegisterRequest request)
        {
            // Check if user exists
            var existingUser = await _repository.GetUserByEmailAsync(request.Email);
            if (existingUser != null)
            {
                throw new InvalidOperationException("User already exists.");
            }

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
            var user = new ModelUser
            {
                Email = request.Email,
                PasswordHash = passwordHash,
                Role = request.Role.ToUpper()
            };

            await _repository.CreateUserAsync(user);
            return await _repository.GetUserByEmailAsync(request.Email);
        }

        public async Task<LoginResponse?> LoginAsync(LoginRequest request)
        {
            var user = await _repository.GetUserByEmailAsync(request.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return null;
            }

            var token = GenerateJwtToken(user);
            return new LoginResponse
            {
                Token = token,
                Role = user.Role,
                Username = user.Email
            };
        }

        private string GenerateJwtToken(ModelUser user)
        {
            // ...

            var jwtSettings = _configuration.GetSection("JwtSettings");
            var key = Encoding.UTF8.GetBytes(jwtSettings["Secret"] ?? "super_secret_key_change_me_in_prod");

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("id", user.Id.ToString())
            };

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(24),
                signingCredentials: new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256)
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
