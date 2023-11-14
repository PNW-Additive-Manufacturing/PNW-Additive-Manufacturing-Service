using System.Net.Http.Headers;
using System.Text.Json;
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
    private readonly PrintingDbContext _db;

    public RequestController(ILogger<RequestController> logger, PrintingDbContext db)
    {
        _logger = logger;
        _db = db;
    }

    [HttpGet]
    public ActionResult<IEnumerable<Request>> Index()
    {   
        var requests = this._db.Requests.ToList();
        foreach (var request in requests)
        {
            request.Parts = this._db.Parts.Where(p => p.RequestId == request.Id).ToList();
        }

        return new JsonResult(requests);
    }

    
}