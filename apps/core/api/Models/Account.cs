using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Security.Claims;

namespace Models;

[Table("account")]
public class Account  {
    public enum PermissionType 
    {
        User,
        Maintainer,
        Admin
    }

    [Required]
    public string FirstName { get; set; }

    [Required]
    public string LastName { get; set; }

    [Key, EmailAddress, Required]
    public string Email { get; set; }

    [Required]
    public string Password { get; set; }

    // public PermissionType Permission { get; set; } = PermissionType.User;
    public int Permission { get; set; }

    public Guid? VerificationId { get; set; } = null;
}
