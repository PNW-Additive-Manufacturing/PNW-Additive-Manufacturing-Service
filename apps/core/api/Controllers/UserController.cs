using System.Net.Http.Headers;
using System.Text.Json;
using System.Data.SqlClient;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Models;

namespace Controllers;
[ApiController]
[Route("[controller]")]
public class UserController : ControllerBase
{
    private readonly ILogger<UserController> _logger;
    private readonly PrintingDbContext _db;


    public UserController(ILogger<UserController> logger, PrintingDbContext db)
    {
        _logger = logger;
        _db = db;
    }
    
    [HttpGet]
    public ActionResult<bool> Index()
    {   
        var requests = _db.Accounts.ToList();
        return new JsonResult(requests, new JsonSerializerOptions() {
             ReferenceHandler = ReferenceHandler.IgnoreCycles
        });
      // return Ok(_db.Database.CanConnect());
    }
}

