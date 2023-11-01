using System.Net;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Models;
using Newtonsoft.Json;
using System.Security.Claims;
using System.Text.Json.Serialization;

namespace Controllers;

[ApiController]
[Route("[controller]")]
public class AuthController : ControllerBase
{

    private readonly ILogger<AuthController> _logger;

    public AuthController(ILogger<AuthController> logger)
    {
        _logger = logger;
    }
    
    public async Task<IActionResult> Index()
    {
        // For fun.
        await Task.Delay(1000);
        return Content("Auth!");   
    }

    public class LoginBody {
        public string username { get; set; }
        public string password { get; set; }
    }

    [HttpGet]
    [Authorize]
    [Route("current")]
    public async Task<IActionResult> Current()
    {
        string? username = HttpContext.User.FindFirst(ClaimTypes.Name)?.Value;

        return Ok($"OK! Welcome {username}");
        // return Ok(HttpContext.User.Claims);

        // if (!this.Request.Cookies.TryGetValue("Authorization", out var aut   horizationCookie)) return Unauthorized();

        // var content = authorizationCookie!.Split(' ');
        // if (content.Length != 2) return Unauthorized();

        // string method = content[0].ToLower();
        // string key = content[1];

        // if (!this._authorizationManager.TryGetSession(key, out var session)) return Unauthorized();
        // return Ok(session);
    }

    [HttpPost]
    [Route("login")]
    public async Task<IActionResult> Login([FromBody] LoginBody body) 
    {
        // https://learn.microsoft.com/en-us/aspnet/core/security/authentication/?view=aspnetcore-7.0
        Console.WriteLine($"Attempting to login: {body.username} {body.password}");

        // var claimsIdentity = new ClaimsIdentity((Claim[])session!.Identity, CookieAuthenticationDefaults.AuthenticationScheme);

        var authProperties = new AuthenticationProperties
        {
            //AllowRefresh = <bool>,
            // Refreshing the authentication session should be allowed.

            ExpiresUtc = DateTimeOffset.UtcNow.AddMinutes(10),
            // The time at which the authentication ticket expires. A 
            // value set here overrides the ExpireTimeSpan option of 
            // CookieAuthenticationOptions set with AddCookie.

            //IsPersistent = true,
            // Whether the authentication session is persisted across 
            // multiple requests. When used with cookies, controls
            // whether the cookie's lifetime is absolute (matching the
            // lifetime of the authentication ticket) or session-based.

            // IssuedUtc = <DateTimeOffset,
            // The time at which the authentication ticket was issued.

            //RedirectUri = <string>
            // The full path or absolute URI to be used as an http 
            // redirect response value.
        };

        // await HttpContext.SignInAsync(
        //     CookieAuthenticationDefaults.AuthenticationScheme, 
        //     new ClaimsPrincipal(claimsIdentity), 
        //     authProperties);

        // _logger.LogInformation("User {Email} logged in at {Time}.", 
        //     session!.Identity.Email, DateTime.UtcNow);

        return Ok("Yay?");

        // if (sessionToken != null) this.Response.Cookies.Append("Authorization", $"Bearer {sessionToken}");

        // return sessionToken == null ? NoContent() : Ok(sessionToken);
    }


}