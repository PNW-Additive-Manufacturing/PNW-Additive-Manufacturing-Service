
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

[Table("part")]
public class Part {
    [Key]
    public short Id { get; set; }

    [Required]
    public short RequestId { get; set; }
    
    [Required]
    public short ModelId { get; set; }

    [Required]
    public int Quantity { get; set; } = 1;

    [Required]
    public PartStatus Status { get; set; } = PartStatus.Pending;

    public string? AssignedPrinterName { get; set; } 

    // [ForeignKey("FilamentId")]
    public short? AssignedFilamentId { get; set; }


    // [NotMapped]
    // public Request Request { get; set; }

    // [NotMapped]
    // public Printer AssignedPrinter { get; set; }

    // [NotMapped]
    // public Filament AssignedFilament { get; set; }
    
}