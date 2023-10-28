using System.Collections.Specialized;
using System;
using System.IO.Ports;
using System.Collections.Generic;
using System.Collections.Concurrent;
using System.Diagnostics;
using System.Text;
using System.Linq;

public interface IPrinterInterface
{
    Task<bool> SendFIle(string fileName, Stream content);
    Task<bool> RunFile(string fileName);
    Task<bool> HasFile(string fileName);


}

internal class PrinterController : IDisposable
{
    

    public SerialPort Serial { get; private set; }
    public EventHandler<string> OnReceiveMessage { get; set;}
    private bool DoDisposePort { get; set; } 
    private Thread SerialThread;
    private readonly ConcurrentQueue<string> CommandQueue = new(); 

    private string? PartialMessage = null; 

    public PrinterController(SerialPort port, bool disposePort = true) 
    {
        this.Serial = port;

        if (!this.Serial.IsOpen) this.Serial.Open();

        this.DoDisposePort = disposePort;
        
        this.SerialThread = new Thread(this.HandleSerial);
        this.SerialThread.Start();
    }

    /// <summary>
    /// Sends a command to the command queue.
    /// </summary>
    /// <param name="command">The G-Code command to be sent.</param>
    /// <returns>The position the command is in, in the queue.</returns>
    public int SendCommand(string command) 
    {
        if (string.IsNullOrWhiteSpace(command)) {
            throw new ArgumentException("Command cannot be empty");
        }

        byte[] bytes = Encoding.ASCII.GetBytes(command);

        int checksum = 0;
        foreach (byte value in bytes) {
            checksum ^= value;
        } 

        this.CommandQueue.Enqueue($"{command}*{checksum}");
        return this.CommandQueue.Count - 1;
    }

    private void HandleSerial() 
    {
        while (true) {
            if (this.Serial.BytesToRead > 0) 
            {
                // Console.WriteLine($"We have {this.BasePort.BytesToRead} bytes to read.");
                try {
                    // Construct and write to our managed buffer.
                    byte[] buffer = new byte[this.Serial.BytesToRead];
                    this.Serial.Read(buffer, 0, this.Serial.BytesToRead);

                    // Convert buffer/encode buffer into an ASCII string.
                    // Remove the End Of Line charter. 
                    string content = Encoding.ASCII.GetString(buffer, 0, buffer.Length);
                    bool isLastMessageComplete = content[^1] == '\n';

                    var messages = content
                        .Split('\n', StringSplitOptions.RemoveEmptyEntries)
                        .Where(message => !string.IsNullOrWhiteSpace(message))
                        .ToList();

                    // No messages, skip to next cycle.
                    if (!messages.Any()) continue;

                    if (this.PartialMessage != null) 
                    {
                        this.PartialMessage += messages[0];   
                        // Multiple messages, we have resolved the partial message!                     
                        if (messages.Count > 1) 
                        {
                            Console.ForegroundColor = ConsoleColor.Green;
                            // Console.WriteLine($"Resolved incomplete message using \"{messages[0]}\"");
                            Console.ResetColor();
                            messages[0] = this.PartialMessage;
                            this.PartialMessage = null;
                        }
                        else 
                        {
                            // Only one command, this is the only partial one.
                            Thread.Sleep(10); // Sleep for 10ms
                            continue;
                        } 
                    }

                    if (!isLastMessageComplete)
                    {
                        // Conditional above should handle this scenario. 
                        Debug.Assert(this.PartialMessage == null, "Incomplete message was not completed before new.");
                        this.PartialMessage = messages.Last();

                        continue;
                    }

                    Console.ForegroundColor = ConsoleColor.Cyan;
                    Console.WriteLine($"Read {messages.Count} message(s) ({buffer.Length} bytes):");

                    Console.ForegroundColor = ConsoleColor.DarkGray;
                    foreach (var message in messages) 
                    {
                        Console.WriteLine($"\t{message}");
                    }
                    Console.ResetColor();

                    // Invoke a callback when reiving a message.
                    // if (this.OnReceiveMessage != null) this.OnReceiveMessage.Invoke(this, content);

                } catch (TimeoutException timeout) {
                    throw timeout;
                    // TODO: Retry serial connection.
                }
            }
            else if (CommandQueue.TryDequeue(out var command))
            {
                try {
                    // I'm not sure what the end-of-command / line character is. May need to add that. I think it is \n
                    this.Serial.WriteLine(command);
                    Console.WriteLine($"Wrote to Serial: {command}");
                } catch (TimeoutException timeout) {
                    throw timeout;
                    // TODO: Retry serial connection.
                }
            }
        }
    }

    public void Dispose()
    {
        if (this.DoDisposePort) this.Serial.Dispose();
        this.SerialThread.Join();
    }
}

internal class Program
{
    private static string PromptPortName() {
        Console.WriteLine("Available Ports:");
        var availablePorts = SerialPort.GetPortNames();
        for (int i = 0; i < availablePorts.Length; i++) {
            Console.WriteLine($"\t{i+1}) {availablePorts[i]}");
        }
        throw new NotImplementedException();
    }
    private static void Main(string[] args)
    {
        Console.WriteLine("Hello, World!");

        Console.WriteLine("Available Ports:");
        var availablePorts = SerialPort.GetPortNames();
        for (int i = 0; i < availablePorts.Length; i++) {
            Console.WriteLine($"\t{i+1}) {availablePorts[i]}");
        }

        var serial = new SerialPort("/dev/ttyUSB0", 115200)
        {
            Handshake = Handshake.None
        };
        using (var controller = new PrinterController(serial))
        // using (var controller = new PrinterController(new SerialPort("/dev/ttyACM0", 115200)))
        {

            // Lets try to send a command!

            controller.SendCommand("G28"); // Home all axes!
            // controller.SendCommand("G0 F1500"); // Set speed to 1500!
            controller.SendCommand("G0 X110 Y110 Z20"); // Go to X: 110, Y 110, Z 80!
            // controller.SendCommand("G0 X10 Y10 Z30"); 
            // controller.SendCommand("G0 X200 Y200 Z50");
            // controller.SendCommand("M300 S440 P200"); // Beep for 200ms.

            // controller.SendCommand("M23 CALIBR~1.GCO"); 
            // controller.SendCommand("M24");

            // controller.SendCommand("G0 F60000");
            // for (int i = 1; i <= 30; i++) {
            //     controller.SendCommand($"G0 X{100 + (i % 2 == 1 ? -50 : 50)} Y{100 + (i % 2 == 1 ? -50 : 50)} Z30");
            // }
            // for (int i = 1; i <= 30; i++) {
            //     controller.SendCommand($"G0 X{100 + (i % 2 == 1 ? 50 : -50)} Y{100 + (i % 2 == 1 ? 50 : -50)} Z30");
            // }
            

            // controller.SendCommand("M31"); // How much time in the print?
            // controller.SendCommand("M20 L");


            while (true) {
                Console.Write("Send command (or exit): ");
                string? command = Console.ReadLine();

                if (command == null || StringComparer.OrdinalIgnoreCase.Compare(command, "exit") == 0) break;
                controller.SendCommand(command);
            }
        }

        Console.WriteLine("Cleaned up. Exiting Program...");
    }
}