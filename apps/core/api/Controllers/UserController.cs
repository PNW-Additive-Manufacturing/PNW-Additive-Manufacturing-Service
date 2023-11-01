using Microsoft.AspNetCore.Mvc;


namespace Controllers 
{
    [ApiController]
    [Route("[controller]")]
    public class UserController : ControllerBase
    {
        private readonly ILogger<UserController> _logger;

        public UserController(ILogger<UserController> logger)
        {
            _logger = logger;
        }
        
        public async Task<IActionResult> Index()
        {
            // For fun.
            await Task.Delay(1000);
            return Content("User!");   
        }
    }
}

