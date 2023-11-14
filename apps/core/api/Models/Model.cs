using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Models;

[Table("model")]
public class Model
{
    [Key]
    public short Id { get; set; }

    [Required]
    public string Name { get; set; }

    [Required]
    public string FilePath { get; set; }

    public string? ThumbnailPath { get; set; } 

    [EmailAddress, Required]
    public string OwnerEmail { get; set; }
}