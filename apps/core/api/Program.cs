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
        var dataSource = new NpgsqlDataSourceBuilder(Environment.GetEnvironmentVariable("DB_CONNECTION"));

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
        if (Environment.GetEnvironmentVariable("DB_CONNECTION") == null)
        {
            throw new InvalidOperationException("Cannot start without DB Connection String");
        }
        var builder = WebApplication.CreateBuilder(args);
        
        //System.Console.WriteLine(Environment.GetEnvironmentVariable("DB_CONNECTION"));

        // Add services to the container.
        builder.Services.AddControllers();
        builder.Services.AddDbContext<PrintingDbContext>();
        builder.Services.AddSingleton<PrinterManager>();

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

        //Use to server static files in <content_root>/wwwroot and to
        //allow index.html files to be accessed without explicitly writing index.html
        //app.UseStaticFiles(); //required for serving static files in <content_root>/wwwroot
        app.UseFileServer();

       //app.UseAuthentication();
       // app.UseAuthorization();

        app.MapControllers();

        app.Run();
    }
}