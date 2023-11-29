using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Models;

[Table("printer")]
public class Printer 
{
    [Key]
    public string Name { get; set; }

    [Required]
    public string Model { get; set; }

    [Required]
    public List<int> Dimensions { get; set; }

    public string CommunicationStrategy { get; set; }
    public string CommunicationStrategyOptions { get; set; }


    [Required]
    public List<string> SupportedMaterials { get; set; } = new();

    public bool OutOfOrder { get; set; } = false;

    public List<short> Queue { get; set; } = new();
}
