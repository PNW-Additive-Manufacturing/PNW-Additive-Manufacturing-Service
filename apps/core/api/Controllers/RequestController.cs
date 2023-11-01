using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Controllers;

[ApiController]
[Route("[controller]")]
public class RequestController : ControllerBase
{
    private readonly ILogger<RequestController> _logger;
    private readonly DbContext _db;

    public RequestController(ILogger<RequestController> logger, DbContext db)
    {
        _logger = logger;
        _db = db;
    }
    
    [HttpGet]
    public async Task<IActionResult> Index()
    {
                        

        // For fun.
        await Task.Delay(1000);
        return Content("Request!");   
    }
}