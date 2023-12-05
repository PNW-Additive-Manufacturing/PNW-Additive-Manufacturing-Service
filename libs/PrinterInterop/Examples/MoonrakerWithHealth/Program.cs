using System.Diagnostics;
using PrinterInterop;


Console.WriteLine("Hello, World!");

var moonrakerStrategy = new MoonrakerCommunicationStrategy(new MoonrakerCommunicationOptions() {
    Host = new Uri("http://192.168.8.172:7128"),
    ExtruderCount = 1,
    HasHeatedBed = true
});
var health = new ConnectionHealth(moonrakerStrategy, TimeSpan.FromSeconds(10))
{
    OnConnect = () => {
        WriteLineWithColor("Connected!", ConsoleColor.DarkGreen);
        return Task.CompletedTask;
    },
    OnReconnectAttempt = (attemptNumber) => {
        WriteLineWithColor($"Attempted reconnection: #{attemptNumber}!", ConsoleColor.DarkYellow);
        return Task.CompletedTask;
    },
    OnDisconnect = () => {
        WriteLineWithColor("Failed to connect! Bummer.", ConsoleColor.DarkRed);
        return Task.CompletedTask;
    }
};
health.Start();

Console.WriteLine("Press any key to exit!");
Console.ReadLine();

void WriteLineWithColor(string? value, ConsoleColor textColor = default)
{
    Console.ForegroundColor = textColor;
    Console.WriteLine(value);
    Console.ResetColor();
}
