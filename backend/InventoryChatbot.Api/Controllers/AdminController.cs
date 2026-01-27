using InventoryChatbot.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventoryChatbot.Api.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "ADMIN")]
    public class AdminController : ControllerBase
    {
        private readonly InventoryRepository _repository;

        public AdminController(InventoryRepository repository)
        {
            _repository = repository;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var stats = await _repository.GetDashboardStatsAsync();
            return Ok(new
            {
                totalQueries = stats.TotalQueries,
                guardrailRejections = stats.GuardrailRejections,
                activeUsers = stats.ActiveUsers
            });
        }
    }
}
