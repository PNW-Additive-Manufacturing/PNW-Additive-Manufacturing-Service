using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;
using FluentStorage.Blobs;
using FluentStorage;
using Microsoft.AspNetCore.Mvc;
using Sentry;
using Models;

public class DatabaseContext : DbContext
{
    public DbSet<User> Users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseNpgsql("Host=my_host;Database=my_db;Username=my_user;Password=my_pw");
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
        builder.Services.AddDbContext<DatabaseContext>();

        var app = builder.Build();

        // Configure the HTTP request pipeline.
        if (!app.Environment.IsDevelopment())
        {
            app.UseExceptionHandler("/Home/Error");
            app.UseHttpsRedirection();
            // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
            app.UseHsts();
        }

        app.UseRouting();

        // app.UseAuthorization();

        app.MapControllers();


        // app.MapControllerRoute(
        //     name: "default",
        //     pattern: "{controller}/{action}/{id}");

        app.Run();
    }
}