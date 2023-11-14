using System.Net.Http.Headers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Models;

namespace Controllers;

[ApiController]
[Route("[controller]")]
public class RequestController : ControllerBase
{
    private readonly ILogger<RequestController> _logger;
    private readonly DatabaseContext _db;

    public RequestController(ILogger<RequestController> logger, DatabaseContext db)
    {
        _logger = logger;
        _db = db;
    }
    
    [HttpGet]
    // public IActionResult Index()
    public ActionResult<IEnumerable<Order>> Index()
    {   
        return new JsonResult(this._db.Requests
            .Include(w => w.Parts)
            .ToList()
        );
    }


}