using System.Linq;


namespace PrinterInterop;

public interface ICommunicationStrategy : IDisposable
{
    Task<bool> IsConnected();
    Task<bool> UploadFile(Stream content, string fileName);
    Task<bool> HasFile(string fileName);
    Task<bool> RunFile(string fileName);
    Task<bool> StopPrint();
    Task<PrinterStatus> GetStatus();

    Task<bool> MoveHead(float x, float y, float z);

    public static string NameOf(Type @type) => @type.Name.Split("CommunicationStrategy").First();
}