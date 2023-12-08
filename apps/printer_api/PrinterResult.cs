using PrinterInterop;

namespace PrinterAPI;

public static class PrinterResult
{
    public static IResult Overview(string name, ConnectionState connectionState)
    {
        return Results.Ok(new {
            Name = name,
            ConnectionState = Enum.GetName(connectionState)!.ToLower()
        });
    }

    public static IResult Unavailable(int statusCode) => Results.Problem(statusCode: statusCode);
}