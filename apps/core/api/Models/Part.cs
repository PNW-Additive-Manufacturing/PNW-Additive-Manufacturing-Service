
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
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
    [ForeignKey("OrderId"), Required]
    public Guid OrderId;

    [NotMapped]
    public Order Order { get; set; }

    [Required]
    public string Name;

    [Required]
    public PartStatus Status;

    [Required]
    public int Quantity = 1;

    public string PrinterName;

    [Required]
    public int FilamentId;
    
}