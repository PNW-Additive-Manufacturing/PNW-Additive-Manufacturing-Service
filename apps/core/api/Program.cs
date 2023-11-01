using System.Collections.Concurrent;
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;
using FluentStorage.Blobs;
using FluentStorage;
using Microsoft.AspNetCore.Mvc;
using Sentry;
using Models;
using System.Buffers.Text;
using System.Text;
using Microsoft.VisualBasic;
using Microsoft.AspNetCore.Authentication.Cookies;
using System.Diagnostics.CodeAnalysis;

public class DatabaseContext : DbContext
{
    public DbSet<User> Users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseNpgsql("Host=my_host;Database=my_db;Username=my_user;Password=my_pw");
}

// public class SessionConstraints 
// {
//     public TimeSpan ValidFor { get; set; } = TimeSpan.FromDays(1); 
// }
// public class AuthorizationManager<Identity>
// {
//     public class Session
//     {
//         public DateTime CreatedAt { get; init; } = DateTime.UtcNow;
//         public Identity Identity { get; init; }

//         public Session(Identity identity) 
//         {
//             this.Identity = identity;
//         }
//     }

//     public delegate string GenerateSessionToken(Identity identity);
//     public delegate Identity? RetrieveIdentity(string username, string password);

//     private readonly ConcurrentDictionary<string, Session> Sessions = new();

//     public TimeSpan SessionLife { get; set; } = TimeSpan.FromDays(1);
//     public RetrieveIdentity? DoRetrieveIdentity { get; set; }
//     public GenerateSessionToken? DoGenerateSessionToken { get; set; }

//     public bool TryGetSession(string sessionToken, out Session? session) 
//     {
//         if (!this.Sessions.TryGetValue(sessionToken, out session)) return false;
//         if (DateTime.UtcNow > session.CreatedAt + SessionLife) 
//         {
//             // Session has expired!
//             this.Sessions.Remove(sessionToken, out var _);
//             return false;
//         }
//         return true;
//     }

//     public string? Login(string username, string password) 
//     {
//         if (this.DoRetrieveIdentity == null)
//             throw new MissingMemberException("Unable to retrieve the Identity of requested User.", nameof(this.DoRetrieveIdentity));
//         if (this.DoGenerateSessionToken == null)
//             throw new MissingMemberException("Unable to generate SessionToke for requested User.", nameof(this.DoGenerateSessionToken));

//         Identity? identity = this.DoRetrieveIdentity(username, password);
//         if (identity == null) {
//             Console.WriteLine("No identity!");
//             return null;
//         }

//         string sessionToken = this.DoGenerateSessionToken(identity);
//         this.Sessions.TryAdd(sessionToken, new Session(identity));
//         Console.WriteLine($"\tCreated Session: {sessionToken}");
//         return sessionToken;
//     }
// }

internal class Program
{
    private static void InitSentry(bool developmentMode) 
    {
        if (Environment.GetEnvironmentVariable("SentryDSN") == null) return;

        SentrySdk.Init(options => 
        {
            options.Dsn = Environment.GetEnvironmentVariable("SentryDSN")!;
            options.Debug = developmentMode;
            options.EnableTracing = true;
            options.AutoSessionTracking = true;
            options.IsGlobalModeEnabled = false;

            // Capture 10% of transactions.
            options.TracesSampleRate = 0.1;
        });
    }

    private static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);


        // Add services to the container.
        builder.Services.AddControllers();
        builder.Services.AddDbContext<DatabaseContext>();

        // https://learn.microsoft.com/en-us/aspnet/core/security/authentication/?view=aspnetcore-7.0
        builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
            .AddCookie(options => {
                options.ExpireTimeSpan = TimeSpan.FromDays(1);
                options.SlidingExpiration = true;
                options.AccessDeniedPath = "/Forbidden/";
            });

        var app = builder.Build();

        // Configure the HTTP request pipeline.
        if (!app.Environment.IsDevelopment())
        {
            app.UseExceptionHandler("/Home/Error");
            app.UseHttpsRedirection();
            // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
            app.UseHsts();
        }

        app.UseCookiePolicy(new CookiePolicyOptions() {
            MinimumSameSitePolicy = SameSiteMode.Lax
        });

        app.UseRouting();

        app.UseAuthentication();
        app.UseAuthorization();


        // app.UseAuthorization();

        app.MapControllers();


        // app.MapControllerRoute(
        //     name: "default",
        //     pattern: "{controller}/{action}/{id}");

        app.Run();
    }
}