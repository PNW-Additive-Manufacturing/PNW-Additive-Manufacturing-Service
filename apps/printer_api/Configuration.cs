using System.Text.Json;

namespace PrinterAPI;

public class Configuration
{
    public static string Location => Environment.GetEnvironmentVariable("PRINTER_CONFIG_PATH") ?? "printers.json";

    private static PrinterConfiguration[]? LoadedConfiguration { get; set; }

    public static bool Exists() => File.Exists(Location);

    public static void Set(PrinterConfiguration[] configurations)
    {
        // Update the current, in-memory, configuration.
        LoadedConfiguration = configurations;

        using var writer = new StreamWriter(File.Open(Location, FileMode.Create));
        writer.Write(JsonSerializer.Serialize(configurations));
    }

    public static PrinterConfiguration[] Update()
    {
        using var stream = File.OpenRead(Location);
        LoadedConfiguration = JsonSerializer.Deserialize<PrinterConfiguration[]>(stream)!;
        return LoadedConfiguration;
    }

    public static PrinterConfiguration[] Get()
    {
        if (!Exists()) 
        {
            // Generate the configuration file.
            LoadedConfiguration = Array.Empty<PrinterConfiguration>();
            Set(LoadedConfiguration);
            return LoadedConfiguration;
        }

        if (LoadedConfiguration != null) return LoadedConfiguration;

        return Update();;
    }
}