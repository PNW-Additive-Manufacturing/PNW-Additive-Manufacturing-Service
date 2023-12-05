using System.Text.Json;


namespace PrinterInterop;

public static class JsonElementExtensions
{
    public static float GetSingle(this JsonElement element, string propertyName)
    {
        return element.GetProperty(propertyName).GetSingle();
    }

    public static string? GetString(this JsonElement element, string propertyName)
    {
        return element.GetProperty(propertyName).GetString();
    }
}