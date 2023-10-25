using Microsoft.AspNetCore.Mvc;

namespace Controllers;

[ApiController]
[Route("[controller]")]
public class RequestController : ControllerBase
{
    private readonly ILogger<RequestController> _logger;

    public RequestController(ILogger<RequestController> logger)
    {
        _logger = logger;
    }
    
    public async Task<IActionResult> Index()
    {
        // For fun.
        await Task.Delay(1000);
        return Content("Request!");   
    }
}