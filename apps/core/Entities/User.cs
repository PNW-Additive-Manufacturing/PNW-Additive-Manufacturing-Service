using System.ComponentModel.DataAnnotations;

public class User {
    public string FirstName;
    public string LastName;

    [EmailAddress]
    public string Email;
}
