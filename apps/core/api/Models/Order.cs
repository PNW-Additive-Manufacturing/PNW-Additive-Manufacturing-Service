using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Models;

[Table("Request")]
public class Order {
    [Key]
    public Guid Id { get; set; }

    [Required]
    public string AccountId;

    [Required]
    public DateTime SubmitTime { get; set; } = DateTime.UtcNow; 

    [Required]
    public bool IsFullfilled;

    public ICollection<Part> Parts { get; set; } = new List<Part>(); 
}