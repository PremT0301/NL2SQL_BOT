using DotNetEnv;
using InventoryChatbot.Api.Data;
using InventoryChatbot.Api.Middleware;
using InventoryChatbot.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

DotNetEnv.Env.Load();
var apiKey = Environment.GetEnvironmentVariable("LlmSettings__ApiKey");
if (apiKey != null)
{
    Console.WriteLine($"DEBUG: Startup API Key Found (Length: {apiKey.Length})");
}

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Register Custom Services
builder.Services.AddHttpClient<LlmService>();
builder.Services.AddScoped<SqlGuardService>();
builder.Services.AddScoped<InventoryRepository>();
builder.Services.AddScoped<QueryProcessorService>();
builder.Services.AddTransient<AuthService>();
builder.Services.AddTransient<DbInitializer>();
builder.Services.AddSingleton<MetricsService>();

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
// Fallback key if not present (Development only)
var secretStr = jwtSettings["Secret"] ?? "super_secret_key_change_me_in_prod_12345";
var secretKey = Encoding.UTF8.GetBytes(secretStr);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"] ?? "InventoryChatbot",
        ValidAudience = jwtSettings["Audience"] ?? "InventoryChatbotClient",
        IssuerSigningKey = new SymmetricSecurityKey(secretKey)
    };
});

// CORS Setup
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    // app.UseSwagger();
}

app.UseMiddleware<RequestLoggingMiddleware>();
app.UseHttpsRedirection();
app.UseCors("AllowReactApp");

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Initialize Database on Startup
using (var scope = app.Services.CreateScope())
{
    var dbInitializer = scope.ServiceProvider.GetRequiredService<DbInitializer>();
    try
    {
        await dbInitializer.InitializeAsync();
        Console.WriteLine("Database initialized and Admin user seeded.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error initializing database: {ex.Message}");
    }
}

try
{
    app.Run();
}
catch (Exception ex)
{
    Console.WriteLine("CRITICAL STARTUP ERROR: " + ex.ToString());
    throw;
}
