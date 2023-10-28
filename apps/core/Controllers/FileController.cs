using Microsoft.AspNetCore.Mvc;

namespace Controllers;

[ApiController]
[Route("[controller]")]
public class FileController : ControllerBase
{
    private readonly ILogger<FileController> _logger;

    public FileController(ILogger<FileController> logger)
    {
        _logger = logger;
    }

    [HttpGet]
    [Route("{partId:int}")]
    public async Task<IActionResult> GetSTL(int partId) 
    {
        // https://devblogs.microsoft.com/dotnet/attribute-routing-in-asp-net-mvc-5/ 
        
    }

    public async Task<IActionResult> Index()
    {
        // For fun.
        await Task.Delay(1000);
        return Content("Files!");   
    }
}