using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;
using FluentStorage.Blobs;
using FluentStorage;

public class DatabaseContext : DbContext
{
    public DbSet<User> Users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseNpgsql("Host=my_host;Database=my_db;Username=my_user;Password=my_pw"); 
}


internal class Program
{
    private static void Main(string[] args)
    {

        var storageDirectory = Directory.CreateDirectory("../storage");
        IBlobStorage storage = StorageFactory.Blobs.DirectoryFiles(storageDirectory.FullName);

        storage.WriteTextAsync($"gcode/{requestId}-{name}.gcode", "some gcode file content");
        storage.WriteTextAsync($"stl/{requestId}-{}.gcode", "some stl content");

        var builder = WebApplication.CreateBuilder(args);
        var app = builder.Build();

        app.MapGet("/", () => "Hello World!");

        app.MapGet("/user", () => "user");

        app.MapGet("/request", () => "request");

        app.MapGet("/printer", () => "printer");

        app.MapGet("/filament", () => "filament");

        app.MapGet("/files/{id}", () => "files");
        
        app.Run();
    }
}