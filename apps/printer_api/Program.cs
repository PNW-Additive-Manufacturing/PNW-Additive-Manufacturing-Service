using PrinterInterop;
using System.Text.Json;

namespace PrinterAPI;

internal class Program
{
    private static readonly Dictionary<string, (PrinterConnection, PrinterConfiguration)> Printers = new();

    private static async Task Main(string[] args)
    {
        await LoadPrinters();

        var builder = WebApplication.CreateBuilder(args);

        var app = builder.Build();

        app.MapGet("/", () => "Hello Printers!");

        app.MapGet("/printers", () => Results.Ok(Printers.Select(printer => new {

            IsConnected = printer.Value.Item1.IsConnected,
            Name = printer.Value.Item2.Name
        })));

        app.MapGet("/printer/{name}", async (string name) => {

            if (!Printers.TryGetValue(name, out var selectedPrinter))
            {
                return Results.NotFound();
            }

            PrinterStatus? status;
            try
            {
                status = await selectedPrinter.Item1.CommunicationStrategy.GetStatus();
            }
            catch (Exception ex)
            {
                Console.ForegroundColor = ConsoleColor.DarkRed;
                Console.WriteLine($"Failed to Retrieve Status of {selectedPrinter.Item2.Name}\n{ex}");
                Console.ResetColor();

                // Ignore.
                status = null;
            }

            return Results.Ok(new {
                IsConnected = selectedPrinter.Item1.IsConnected,
                Name = selectedPrinter.Item2.Name,
                Status = status
            });
        });

        app.MapGet("/configuration", () => Results.Ok(Configuration.Get()));

        app.MapPost("/configuration", (PrinterConfiguration[] configurations) => {
            
            Console.ForegroundColor = ConsoleColor.DarkBlue;
            Console.WriteLine("Updating Configurations");
            Console.ResetColor();

            Configuration.Set(configurations);
            LoadPrinters();

            return Results.Ok();
        });

        app.Run("http://localhost:3000");
    }

    private static Task LoadPrinters()
    {
        Printers.Clear();

        Console.WriteLine("Loading Printers...");

        foreach (var printerConfig in Configuration.Get())
        {
            PrinterConnection connection;

            try 
            {
                connection = printerConfig.GetConnection();
            }
            catch (Exception ex)
            {
                Console.ForegroundColor = ConsoleColor.DarkRed;
                Console.WriteLine($"Failed to Load Printer: {printerConfig.Name}\n{ex}");
                Console.ResetColor();
                continue;
            }

            connection.OnDisconnect = () => {
                Console.WriteLine($"Disconnected: {printerConfig.Name}");
                return Task.CompletedTask;
            };
            connection.OnReconnectAttempt = (int attempt) => {
                Console.WriteLine($"Attempting to Reconnect #{attempt}: {printerConfig.Name}");
                return Task.CompletedTask;
            };
            connection.OnConnect = () => {
                Console.WriteLine($"Connected: {printerConfig.Name}");
                return Task.CompletedTask;
            };
            
            if (Printers.TryGetValue(printerConfig.Name, out var existingConnection))
            {
                existingConnection.Item1.CommunicationStrategy.Dispose();
                Printers.Remove(printerConfig.Name);
            }

            Printers.Add(printerConfig.Name, new (connection, printerConfig));
            Console.ForegroundColor = ConsoleColor.DarkBlue;
            Console.WriteLine($"Loaded Printer: {printerConfig.Name}");
            Console.ResetColor();
        }

        return Task.CompletedTask;
    }
}
