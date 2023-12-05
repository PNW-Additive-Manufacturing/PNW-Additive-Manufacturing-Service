using PrinterInterop;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace PrinterAPI;

public class PrinterConfiguration
{
    public string Name { get; }
    public string CommunicationStrategy { get; } 
    public object CommunicationOptions { get; }

    
    [JsonConstructor]
    public PrinterConfiguration(string name, string communicationStrategy, object communicationOptions)
    {
        this.Name = name;
        this.CommunicationStrategy = communicationStrategy;
        this.CommunicationOptions = communicationOptions;
    }

    public ConnectionHealth GetConnection()
    {
        var strategy = CommunicationStrategy switch
        {
            "moonraker" => new MoonrakerCommunicationStrategy(((JsonElement)CommunicationOptions).Deserialize<MoonrakerCommunicationOptions>()!)!,
            _ => throw new NotSupportedException($"Communication Strategy: {CommunicationStrategy} is not supported!")
        };
        return new ConnectionHealth(strategy, TimeSpan.FromSeconds(10));
    }
}
