using System.Diagnostics;
using PrinterInterop;

Console.WriteLine("Hello, World!");

var moonraker = new MoonrakerCommunicationStrategy(new MoonrakerCommunicationOptions() {
    Host = new Uri("http://192.168.8.172:7127"),
    ExtruderCount = 1,
    HasHeatedBed = true
});

// Uncomment to upload and run gcode.
// const string gcodeFile = "gcodeToRun.gcode";
// if (File.Exists(gcodeFile))
// {
//     using (var file = File.Open(gcodeFile, FileMode.Open)) 
//     {
//         Console.WriteLine(await moonraker.UploadFile(file, gcodeFile));
//     }
//     Console.WriteLine(await moonraker.RunFile(gcodeFile));
// }

// Wait 5 seconds!
// Thread.Sleep(3 * 1000);

// Print out the printer status.
var status = await moonraker.GetState();

Console.ForegroundColor = ConsoleColor.DarkYellow;
Console.WriteLine($"Status: {status}");

if (status == PrinterState.Printing)
{
    var printStatus = await moonraker.GetPrintStatus();

    Console.WriteLine($"Selected File: {printStatus.SelectedFile}");
    Console.WriteLine($"Elapsed Time: {printStatus.ElapsedTime}");
    Console.WriteLine($"Started At: {printStatus.PrintStartedAt}");
    Console.WriteLine($"Progress: {printStatus.Progress}%");
}
else if (status == PrinterState.Cancelled)
{
    var printStatus = await moonraker.GetPrintStatus();

    Console.WriteLine($"Selected File: {printStatus.SelectedFile}");
    Console.WriteLine($"Started At: {printStatus.PrintStartedAt}");
    Console.WriteLine($"Progress: {printStatus.Progress}%");
}
else
{
    Console.WriteLine("Not Printing");
}

Console.ForegroundColor = ConsoleColor.Red;
Console.WriteLine("Temperatures:");
var temps = await moonraker.GetTemperatures();
foreach (var (key, temp) in temps)
{
    Console.WriteLine($"| {key}\t{temp}°");
}

Console.ForegroundColor = ConsoleColor.Blue;
var toolPosition = await moonraker.GetExtruderPosition();
Console.WriteLine($"Tool: ({toolPosition.Item1}, {toolPosition.Item2}, {toolPosition.Item3})");

Console.ForegroundColor = ConsoleColor.Magenta;
Console.WriteLine("Files:");
var files = await moonraker.GetFiles();
foreach (var file in files) Console.WriteLine($"| {file}");

Console.ResetColor();
