using System.Linq;


namespace PrinterInterop;

public struct PrintStatus
{
    public string SelectedFile { get; set; }
    public TimeSpan ElapsedTime { get; set; }
    public DateTime PrintStartedAt { get; set; }
    public float Progress { get; set; }
}

public enum PrinterState 
{
    Standby,
    Printing,
    Paused,
    Completed,
    Cancelled,
    Error
}

public interface ICommunicationStrategy : IDisposable
{
    /// <summary>
    /// Determines if the host can establish a connection.
    /// </summary>
    /// <returns>Whether or not a connection was established.</returns>
    Task<bool> HasConnection();

    Task<PrinterState> GetState();
    Task<PrintStatus> GetPrintStatus();
    Task<(float, float, float)> GetExtruderPosition();
    Task<IDictionary<string, float>> GetTemperatures();

    Task<bool> UploadFile(Stream content, string fileName);
    Task<bool> HasFile(string fileName);
    Task<bool> RunFile(string fileName);
    Task<bool> StopPrint();

    Task MoveTool(float x, float y, float z);
}