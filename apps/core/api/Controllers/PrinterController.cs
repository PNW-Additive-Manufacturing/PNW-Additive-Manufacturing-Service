using Microsoft.AspNetCore.Mvc;

namespace Controllers;

[ApiController]
[Route("[controller]")]
public class PrinterController : ControllerBase
{
    private readonly ILogger<PrinterController> _logger;

    public PrinterController(ILogger<PrinterController> logger)
    {
        _logger = logger;
    }
    
    public async Task<IActionResult> Index()
    {
        // For fun.
        await Task.Delay(1000);
        return Content("Printer!");   
    }
}