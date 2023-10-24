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
    public PartStatus Status;
}