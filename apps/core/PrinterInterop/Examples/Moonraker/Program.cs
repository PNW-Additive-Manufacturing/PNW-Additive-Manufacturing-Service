using System.Diagnostics;
using PrinterInterop;

Console.WriteLine("Hello, World!");

var moonraker = new MoonrakerCommunicationStrategy(new MoonrakerCommunicationOptions() {
    Host = new Uri("http://192.168.8.172:7128")
});

const string gcodeFile = "gcodeToRun.gcode";
if (File.Exists(gcodeFile))
{
    using (var file = File.Open(gcodeFile, FileMode.Open)) 
    {
        Console.WriteLine(await moonraker.UploadFile(file, gcodeFile));
    }
    Console.WriteLine(await moonraker.RunFile(gcodeFile));
}

// Wait 5 seconds!
Thread.Sleep(5 * 1000);

// Print out the printer status.
var status = await moonraker.GetStatus();
Console.WriteLine($"Selected File: {status.SelectedFile}");
Console.Write($"Print Started At: {status.PrintStartedAt}");
Console.WriteLine($" Elapsed: {(int)status.ElapsedTime!.Value.TotalMinutes} Minutes");
Console.WriteLine($"Print State: {Enum.GetName(status.PrintState)}");
