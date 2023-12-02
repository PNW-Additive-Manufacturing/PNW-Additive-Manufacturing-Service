namespace PrinterInterop;

public enum PrinterPrintState 
{
    Standby,
    Printing,
    Paused
}
public class PrinterStatus
{
    public bool IsConnected { get; }
    public PrinterPrintState? PrintState { get; set; } = PrinterPrintState.Standby; 
    public string? SelectedFile { get; set; }
    public TimeSpan? ElapsedTime { get; set; }
    public DateTime? PrintStartedAt { get; set; }
    public int Progress { get; set; }
}
