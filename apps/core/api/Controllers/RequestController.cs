using System.Net.Http.Headers;
using System.Text.Json;
using System.Text.Json.Serialization;
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
        //var requests = this._db.Requests.ToList();
        
        var requests = this._db.Requests.Include(r => r.Parts).ToList();
        
        foreach (var request in requests)
        {
            // request.Parts = this._db.Parts.Where(p => p.RequestId == request.Id).ToList();
            foreach (var part in request.Parts)
            {
                part.Model = this._db.Models.FirstOrDefault(m => m.Id == part.ModelId);
                
                if (part.AssignedPrinterName != null)
                {
                    part.AssignedPrinter = this._db.Printers.FirstOrDefault(p => p.Name == part.AssignedPrinterName);
                }

                if (part.AssignedFilamentId != null)
                {
                    part.AssignedFilament = this._db.Filaments.FirstOrDefault(f => f.Id == part.AssignedFilamentId);
                }
            }
        }
        
        
        
        return new JsonResult(requests, new JsonSerializerOptions() {
            ReferenceHandler = ReferenceHandler.IgnoreCycles
        });
        
    }


}