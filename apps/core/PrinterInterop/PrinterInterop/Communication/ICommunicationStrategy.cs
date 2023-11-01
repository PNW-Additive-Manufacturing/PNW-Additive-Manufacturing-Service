namespace PrinterInterop;


public interface ICommunicationStrategy : IDisposable
{
    Task<bool> UploadFile(Stream content, string fileName);
    Task<bool> HasFile(string fileName);
    Task<bool> RunFile(string fileName);
    Task<bool> StopPrint();
    Task<PrinterStatus> GetStatus();
}