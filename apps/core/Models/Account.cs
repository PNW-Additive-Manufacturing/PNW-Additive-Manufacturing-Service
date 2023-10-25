using System.ComponentModel.DataAnnotations;

namespace Models;

public class Account {
    public enum PermissionType 
    {
        User,
        Maintainer,
        Admin
    }

    public string FirstName;
    public string LastName;

    [EmailAddress]
    public string Email;

    public string Password;

    public PermissionType Permission = PermissionType.User;

    public Guid? VerificationId;
}
