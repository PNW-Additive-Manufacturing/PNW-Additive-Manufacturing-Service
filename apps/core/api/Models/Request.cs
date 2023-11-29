using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Models;

[Table("request")]
public class Request {
    public short Id { get; set; }

    public string? Name { get; set; }

    [EmailAddress, Required]
    public string OwnerEmail { get; set; } 

    public DateTime SubmitTime { get; set; } = DateTime.Now;
    
    public bool IsFulfilled { get; set; } = false;
    
    public string? Notes { get; set; }


    // [ForeignKey("part_requestid_fkey")]
    [NotMapped]
    public List<Part> Parts { get; set; } = new List<Part>();

    [NotMapped]
    public Account? Owner { get; set; }
}