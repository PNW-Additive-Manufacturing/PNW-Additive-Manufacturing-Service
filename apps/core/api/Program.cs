using System.Threading;
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
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Npgsql;

public class PrintingDbContext : DbContext
{
    public DbSet<Models.Account> Accounts { get; set; }
    public DbSet<Models.Filament> Filaments { get; set; }
    public DbSet<Models.Model> Models { get; set; }
    public DbSet<Models.Part> Parts { get; set; }
    public DbSet<Models.Printer> Printers { get; set; }
    public DbSet<Models.Request> Requests { get; set; }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Models.Request>()
            .HasMany(r => r.Parts)
            .WithOne(p => p.Request)
            .HasForeignKey(p => p.RequestId)
            .HasPrincipalKey(r => r.Id);

        modelBuilder.HasPostgresEnum<PartStatus>();
        modelBuilder.HasPostgresEnum<Account.PermissionType>();
        base.OnModelCreating(modelBuilder);
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        //var dataSource = new NpgsqlDataSourceBuilder(Environment.GetEnvironmentVariable("DB_CONNECTION"));
        var dataSource = new NpgsqlDataSourceBuilder("host=localhost port=5432 dbname=postgres user=postgres password=postgres sslmode=prefer");
        dataSource.MapEnum<PartStatus>();
        dataSource.MapEnum<Account.PermissionType>();

        optionsBuilder
            .UseNpgsql(dataSource.Build())
            .UseLowerCaseNamingConvention();
    }

}

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
        builder.Services.AddDbContext<PrintingDbContext>();
        builder.Services.AddSingleton<PrinterManager>();

        // https://learn.microsoft.com/en-us/aspnet/core/security/authentication/?view=aspnetcore-7.0
        // builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
        //     .AddCookie(options => {
        //         options.ExpireTimeSpan = TimeSpan.FromDays(1);
        //         options.SlidingExpiration = true;
        //         options.AccessDeniedPath = "/Forbidden/";
        //     });

        var app = builder.Build();

        // Configure the HTTP request pipeline.
        if (!app.Environment.IsDevelopment())
        {
            app.UseExceptionHandler("/Home/Error");
            app.UseHttpsRedirection();
            // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
            app.UseHsts();
        }

        // app.UseCookiePolicy(new CookiePolicyOptions() {
        //     MinimumSameSitePolicy = SameSiteMode.Lax
        // });

        app.UseRouting();

        app.UseFileServer();

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