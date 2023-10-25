using System.ComponentModel.DataAnnotations;

namespace Models;

public class Request {
    public Guid Id;
    public string Name;

    [EmailAddress]
    public string AccountEmail;
    public DateTime SubmitTime;
    public bool IsFullfilled;

}