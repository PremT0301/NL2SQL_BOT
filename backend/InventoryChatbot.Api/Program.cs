using InventoryChatbot.Api.Data;
using InventoryChatbot.Api.Services;
using DotNetEnv;

DotNetEnv.Env.Load();
var apiKey = Environment.GetEnvironmentVariable("LlmSettings__ApiKey");
Console.WriteLine($"DEBUG: Startup API Key: '{apiKey}'");
if (apiKey != null)
{
    Console.WriteLine($"DEBUG: Startup Key Length: {apiKey.Length}");
    Console.WriteLine($"DEBUG: Startup Key StartsQuote: {apiKey.StartsWith("\"")}");
}

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
// builder.Services.AddSwaggerGen(); // Not strictly requested, keeping minimal

// Register Custom Services
builder.Services.AddHttpClient<LlmService>();
builder.Services.AddScoped<SqlGuardService>();
builder.Services.AddScoped<InventoryRepository>();
builder.Services.AddScoped<QueryProcessorService>();

// CORS Setup (Allow All for Dev, restrict in Prod)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.AllowAnyOrigin() // Replace with strictly "http://localhost:5173" if needed
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    // app.UseSwagger();
    // app.UseSwaggerUI();
}

app.UseHttpsRedirection(); // Optional, often disabled in dev tunnels but good for prod
app.UseCors("AllowReactApp");
app.UseAuthorization();
app.MapControllers();

app.Run();
