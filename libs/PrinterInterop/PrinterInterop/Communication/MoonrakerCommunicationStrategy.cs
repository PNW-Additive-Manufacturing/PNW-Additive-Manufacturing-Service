using System.Net;
using System.Globalization;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Transactions;
using System.Timers;


namespace PrinterInterop;

public struct MoonrakerCommunicationOptions 
{
    public Uri Host { get; set; }
    public uint ExtruderCount { get; set; }
    public bool HasHeatedBed { get; set; }
}

public class MoonrakerException : HttpRequestException
{
    public int Code { get; }
    public string DetailedMessage { get; }

    public MoonrakerException(int errorCode, string message) 
        : base($"{nameof(MoonrakerException)} (#{errorCode}): {message}")
        {
            this.Code = errorCode;
            this.DetailedMessage = message;
        }
}

public class MoonrakerCommunicationStrategy : ICommunicationStrategy
{
    public MoonrakerCommunicationOptions Options { get; private set; }
    protected HttpClient HttpClient { get; private set; }

    public MoonrakerCommunicationStrategy(MoonrakerCommunicationOptions options) 
    {
        this.Options = options;
        this.HttpClient = new HttpClient() 
        {
            BaseAddress = this.Options.Host
        };
    }

    protected async Task<JsonElement> Get(string url, CancellationToken cancellationToken = default)
    {
        var response = await HttpClient.GetAsync(url, cancellationToken);
        response.EnsureSuccessStatusCode();

        var returnedData =  JsonDocument.Parse(response.Content.ReadAsStream()).RootElement;

        if (returnedData.TryGetProperty("error", out var errorElement))
        {
            var errorCode = errorElement.GetProperty("code").GetInt32()!;
            var errorMessage = errorElement.GetProperty("message").GetString()!;
            throw new MoonrakerException(errorCode, errorMessage);
        }
        return returnedData.GetProperty("result")!;
    }

    protected async Task<JsonElement> FetchPrinterObject(string objectName)
    {
        return (await Get("/printer/objects/query?" + objectName)).GetProperty("status").GetProperty(objectName);
    }
    protected async Task<IDictionary<string, JsonElement>> FetchPrinterObject(params string[] objectNames)
    {
        var status = (await Get($"/printer/objects/query?{string.Join('&', objectNames)}")).GetProperty("status");
        
        var result = new Dictionary<string, JsonElement>();
        foreach (var name in objectNames) result[name] = status.GetProperty(name);

        return result;
    }

    public async Task<bool> HasFile(string fullFileName)
    {
        // NOTE: This will not work with files that are in any folders unless specified in the fileName.
        return (await this.GetFiles()).Contains(fullFileName);
    }

    public async Task<IEnumerable<string>> GetFiles() 
    {
        return (await Get("/server/files/list")).EnumerateArray().Select(prop => prop.GetProperty("path").GetString()!);
    }
    
    public async Task<bool> RunFile(string fileName)
    {
        return (await this.HttpClient.PostAsync($"/printer/print/start?filename={fileName}", null)).IsSuccessStatusCode;
    }

    public async Task<bool> StopPrint()
    {
        // TODO: We are only pausing the print. Not clearing/stopping it.
        return (await this.HttpClient.PostAsync("/printer/print/pause", null)).IsSuccessStatusCode;
    }

    public async Task<bool> UploadFile(Stream stream, string fileName)
    {
        var formData = new MultipartFormDataContent("FormBoundaryemap3PkuvKX0B3HH")
        {
            { new StreamContent(stream), "file", fileName }
        };
        return (await this.HttpClient.PostAsync("/server/files/upload", formData)).IsSuccessStatusCode;
    }

    public async Task MoveTool(float x, float y, float z)
    {
        // TODO: Utilize MoonrakerException!
        (await HttpClient
            .PostAsync($"/printer/gcode/script?script=G0 F500 X{x} Y{y} Z{z}", null))
            .EnsureSuccessStatusCode();
    }

    public async Task<bool> HasConnection()
    {
        try
        {
            // This will query nothing, no print objects are provided.
            return (await HttpClient.GetAsync("/printer/objects/query")).IsSuccessStatusCode;
        }
        catch (HttpRequestException)
        {
            return false;
        }
    }

    public async Task<PrinterState> GetState()
    {
        var currentState = (await FetchPrinterObject("print_stats")).GetString("state")!;

        return Enum.Parse<PrinterState>(currentState, true);
    }

    public async Task<PrintStatus> GetPrintStatus()
    {
        var stats = await FetchPrinterObject("print_stats", "virtual_sdcard");
        var printStats = stats["print_stats"];

        return new PrintStatus
        {
            SelectedFile = printStats.GetString("filename")!,
            ElapsedTime = TimeSpan.FromSeconds(printStats.GetSingle("print_duration")),
            PrintStartedAt = DateTime.UtcNow.AddSeconds(-(int)Math.Floor(printStats.GetSingle("total_duration"))),
            Progress = (int)(stats["virtual_sdcard"].GetSingle("progress")*100)
        };
    }

    public async Task<(float, float, float)> GetExtruderPosition()
    {
        var axes = (await FetchPrinterObject("toolhead")).GetProperty("position").EnumerateArray().ToArray();

        return new (axes[0].GetSingle(), axes[1].GetSingle(), axes[2].GetSingle());
    }

    public async Task<IDictionary<string, float>> GetTemperatures()
    {
        var temperatures = new Dictionary<string, float>();

        if (Options.HasHeatedBed) 
            temperatures.Add("bed", (await FetchPrinterObject("heater_bed")).GetSingle("temperature"));

        // TODO: Query all extruder states at once.
        temperatures.Add("extruder", (await FetchPrinterObject("extruder")).GetSingle("temperature"));
        for(int i = 1; i < Options.ExtruderCount; i++) 
        {
            temperatures.Add($"extruder{i}", (await FetchPrinterObject($"extruder{i}")).GetSingle("temperature"));
        }
        return temperatures;
    }

    public void Dispose()
    {
        this.HttpClient.Dispose();
        GC.SuppressFinalize(this);
    }

}