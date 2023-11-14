using System.ComponentModel.DataAnnotations;
using System.Security.Claims;

namespace Models;

public class Account  {
    public enum PermissionType 
    {
        User,
        Maintainer,
        Admin
    }

    public string FirstName { get; set; }
    public string LastName { get; set; }

    [EmailAddress]
    public string Email { get; set; }

    public string Password;

    public PermissionType Permission { get; set; } = PermissionType.User;

    public Guid? VerificationId { get; set; }


    // public static implicit operator Claim[](Account account) => new Claim[] {
    //     new(ClaimTypes.Name, $"{account.FirstName} {account.LastName}"),
    //     new(ClaimTypes.Role, Enum.GetName(typeof(PermissionType), account.Permission)!),
    //     new(ClaimTypes.Email, account.Email),
    // };
}
