using System.IO.Ports;
using System.Text.RegularExpressions;
using PrinterInterop;

Console.WriteLine("Hello, World!");

Console.WriteLine("Available Ports:");
    var availablePorts = SerialPort.GetPortNames();
    for (int i = 0; i < availablePorts.Length; i++) {
        Console.WriteLine($"\t{i+1}) {availablePorts[i]}");
}

var assignedPort = SerialPort.GetPortNames().First();
var serial = new SerialCommunicationStrategy(new SerialCommunicationOptions()
{
    SerialPort = assignedPort,
    BaudRate = 57600,
    IncludeChecksum = true,
    // Marlin requires BINARY_FILE_TRANSFER
    UseOptimizedFileTransfer = false
});

// Not completed
