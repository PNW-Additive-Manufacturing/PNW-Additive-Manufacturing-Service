using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Models;

namespace Controllers;

[ApiController]
[Route("[controller]")]
public class PrinterController : ControllerBase
{
    private readonly ILogger<PrinterController> _logger;
    private readonly PrintingDbContext _db;
    private readonly PrinterManager _printerManager;

    public PrinterController(ILogger<PrinterController> logger, PrintingDbContext db, PrinterManager printerManager)
    {
        _logger = logger;
        _db = db;
        _printerManager = printerManager;
    }
    
    public async Task<IActionResult> Index()
    {
        return new JsonResult(_printerManager.Connections.AsEnumerable().Select(async c => {
            return new {
                Name = c.Key,
                Status = await c.Value.GetStatus() ?? null
            };
        }));
    }
}