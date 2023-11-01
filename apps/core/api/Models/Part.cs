
using Microsoft.AspNetCore.Authorization.Infrastructure;

namespace Models;

public enum PartStatus 
{
    Pending,
    Denied,
    Queued,
    Printing,
    Printed,
    Failed,
}

public class Part {
    public Guid RequestId;
    public string Name;
    public PartStatus Status;
    public int Quantity;
    public string PrinterName;
    public int FilamentId;
    
}