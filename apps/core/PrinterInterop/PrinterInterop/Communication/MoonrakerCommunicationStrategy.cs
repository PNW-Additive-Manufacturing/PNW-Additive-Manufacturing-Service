using System.Net;
using System.Globalization;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;


namespace PrinterInterop;

public class MoonrakerCommunicationOptions 
{
    public Uri Host { get; set; } = new("http://localhost");
}
public class MoonrakerCommunicationStrategy : ICommunicationStrategy
{
    // protected class MoonrakerPayload
    // {
    //     private static uint _currentId = 0;
    //     public static uint NextId() => _currentId += 1;

        
    //     [JsonPropertyName("id")]
    //     public uint Id { get; } = NextId();

    //     [JsonPropertyName("method")]
    //     public string Method { get; set; }

    //     [JsonPropertyName("params")]
    //     public Dictionary<string, object> Parameters { get; } = new();

    //     [JsonPropertyName("jsonrpc")]
    //     public string JsonRpcVersion { get; set; } = "2.0";

    //     public MoonrakerPayload(string method) => (Method) = (method);
    // }

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

    public async Task<PrinterStatus> GetStatus()
    {
        var resp = await HttpClient.PostAsync("/printer/objects/query?print_stats&virtual_sdcard", null);
        resp.EnsureSuccessStatusCode();

        var results = JsonDocument.Parse(resp.Content.ReadAsStream()).RootElement.GetProperty("result").GetProperty("status");
        var printStats = results.GetProperty("print_stats");
        var virtualSd = results.GetProperty("virtual_sdcard");

        // We could convert this to a dedicated json serializer for the printer status class 
        // though serialization depends on the strategy being used. This seems like an adequate solution for the time being.

        PrinterPrintState printState = printStats.GetProperty("state").GetString()! switch
        {
            "printing" => PrinterPrintState.Printing,
            "paused" => PrinterPrintState.Paused,
            _ => PrinterPrintState.Standby,
        };
        PrinterStatus printerStatus = new()
        {
            // CLEANUP: Use switch expression to declare State instead of separately above ^
            PrintState = printState,
        };

        if (printState != PrinterPrintState.Standby) 
        {
            printerStatus.SelectedFile = printStats.GetProperty("filename").GetString();
            printerStatus.ElapsedTime = TimeSpan.FromSeconds(printStats.GetProperty("print_duration").GetDouble());
            printerStatus.PrintStartedAt = DateTime.UtcNow - printerStatus.ElapsedTime;
            printerStatus.Progress = (int)Math.Round(virtualSd.GetProperty("progress").GetDouble());
        }

        return printerStatus;
    }

    public async Task<bool> HasFile(string fullFileName)
    {
        // NOTE: This will not work with files that are in any folders unless specified in the fileName.
        return (await this.GetFiles()).Contains(fullFileName);
    }

    public async Task<IEnumerable<string>> GetFiles() 
    {
        var resp = await HttpClient.GetAsync("/server/files/list");
        resp.EnsureSuccessStatusCode();

        return JsonDocument.Parse(resp.Content.ReadAsStream())
            .RootElement.EnumerateArray()
            .Select(prop => prop.GetProperty("path").GetString()!);
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

    public void Dispose()
    {
        this.HttpClient.Dispose();
        GC.SuppressFinalize(this);

    }

    public async Task<bool> IsConnected()
    {
        try
        {
            // TODO: Replace with more suited endpoint.
            return (await HttpClient.GetAsync("/server/files/list")).IsSuccessStatusCode;
        }
        catch (HttpRequestException)
        {
            return false;
        }
    }

    public Task<bool> MoveHead(float x, float y, float z)
    {
        throw new NotImplementedException();
    }

    // protected async Task<IDictionary<string, object>> PostAsync<R>(string requestUri, MoonrakerPayload payload)
    // {
    //     var res = await this.HttpClient.PostAsJsonAsync(requestUri, payload);
    //     var jsonDoc = JsonDocument.Parse(res.Content.ReadAsStream());

    //     // Ignore the ID.
    //     // var id = jsonDoc.RootElement.GetProperty("id").GetUInt32();

    //     return jsonDoc.RootElement.GetProperty("result").Deserialize<IDictionary<string, object>>()!;
    // }
}