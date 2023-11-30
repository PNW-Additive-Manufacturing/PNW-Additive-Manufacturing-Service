using PrinterInterop;

public class PrinterManager
{
    public Dictionary<string, ICommunicationStrategy> Connections { get; } = new();

    // Dependencies
    // private readonly PrintingDbContext _db;

    public PrinterManager()
    {
        // this._db = db;
        this.LoadPrinters();

        
    }



    public void LoadPrinters()
    {
        this.Connections.Add("Bob", new MoonrakerCommunicationStrategy(new MoonrakerCommunicationOptions()
        {
            Host = new Uri("http://192.168.8.172")
        }));
        
    }
}