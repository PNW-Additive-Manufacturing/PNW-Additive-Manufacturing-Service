using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Models;

[Table("filament")]
public class Filament 
{
    public short Id { get; set; }

    [Required]
    public string Material { get; set; }

    [Required]
    public string Color { get; set; }
    
    public bool InStock { get; set; } = true;
}