using System.Collections.Concurrent;
using System.Diagnostics;
using System.Diagnostics.CodeAnalysis;
using System.IO.Ports;
using System.Text;
using System.Threading;
using System.Text.RegularExpressions;


namespace PrinterInterop;

public class SerialCommunicationOptions 
{
    /// <summary>
    /// SerialPort.BaudRate
    /// </summary>
    /// <value></value>
    public string SerialPort { get; set; } = "/dev/ttyUSB0";
    public int BaudRate { get; set; } = 115200;
    public bool IncludeChecksum { get; set; } = true;

    /// <summary>
    /// Marlin requires BINARY_FILE_TRANSFER
    /// </summary>    
    public bool UseOptimizedFileTransfer { get; set; } = false;
}
public class SerialCommunicationStrategy : ICommunicationStrategy
{
    public class SerialIncomingEvent : IDisposable, IEquatable<Regex>
    {
        public Regex Pattern { get; }
        public ManualResetEvent BaseEvent { get; }
        public string? ReceivedData { get; private set; } 

        public SerialIncomingEvent(Regex pattern)
        {
            this.Pattern = pattern;
            this.BaseEvent = new ManualResetEvent(false);
        }

        public void Set(string data) 
        {
            this.ReceivedData = data;
            this.BaseEvent.Set();
        }

        public override int GetHashCode() => this.Pattern.GetHashCode();

        public bool Equals(Regex? other) => other != null && other == this.Pattern;

        public void Dispose() => this.BaseEvent.Dispose();

    }

    public SerialCommunicationOptions Options { get; private set; }
    protected SerialPort Serial { get; init; } 
    protected Thread CommunicationThread { get; init; }

    protected readonly HashSet<SerialIncomingEvent> _incomingEvents = new();
    protected readonly ConcurrentQueue<string> _commandQueue = new(); 
    protected string? _partialMessage = null;

    public SerialCommunicationStrategy(SerialCommunicationOptions options) 
    {
        this.Options = options;
        this.Serial = new SerialPort(this.Options.SerialPort)
        {
            BaudRate = this.Options.BaudRate,
            Handshake = Handshake.RequestToSend
        };
        this.Serial.Open();

        this.CommunicationThread = new Thread(this.HandleSerial);
        this.CommunicationThread.Start();
    }

    public Task<PrinterStatus> GetStatus()
    {
        throw new NotImplementedException();
    }

    public Task<bool> HasFile(string fileName)
    {
        throw new NotImplementedException();
    }


    public Task<bool> RunFile(string fileName)
    {
        throw new NotImplementedException();
    }

    public Task<bool> StopPrint()
    {
        throw new NotImplementedException();
    }

    public Task<bool> UploadFile(Stream content, string fileName)
    {
        // https://marlinfw.org/docs/gcode/M028.html
        lock (this._commandQueue) 
        {
            this.SendCommand($"M28{(Options.UseOptimizedFileTransfer ? " B1" : "")} {fileName}");

            using var reader = new StreamReader(content);
            string? currentLine = reader.ReadLine();

            while (currentLine != null)
            {
                this.SendCommand(currentLine);
                currentLine = reader.ReadLine();
            }
            this.SendCommand("M29");
        }
        return Task.FromResult(true);
    }

    public virtual SerialIncomingEvent WaitForSerial(Regex pattern)
    {
        var incomingEvent = this._incomingEvents.FirstOrDefault(e => e.Equals(pattern));

        if (incomingEvent == null) 
        {
            incomingEvent = new SerialIncomingEvent(pattern);
            this._incomingEvents.Add(incomingEvent);
        }

        // Now, wait for the event to be raised.
        incomingEvent.BaseEvent.WaitOne();
        return incomingEvent;
    }

    /// <summary>
    /// Sends a command to the command queue.
    /// </summary>
    /// <param name="command">The G-Code command to be sent.</param>
    /// <returns>The position the command is in, in the queue.</returns>
    public virtual int SendCommand(string command) 
    {
        if (string.IsNullOrWhiteSpace(command))
            throw new ArgumentException("Command cannot be empty");

        var builtCommand = new StringBuilder();

        // Include linenumber if implemented.

        builtCommand.Append(command);

        if (this.Options.IncludeChecksum)
        {
            byte[] bytes = Encoding.ASCII.GetBytes(builtCommand.ToString());

            int checksum = 0;
            foreach (byte value in bytes) {
                checksum ^= value;
            }
            builtCommand.Append($"*{checksum}");
        }

        this._commandQueue.Enqueue(builtCommand.ToString());
        return this._commandQueue.Count - 1;
    }

    protected virtual void HandleSerial() 
    {
        while (true) {
            if (this.Serial.BytesToRead > 0) 
            {
                Console.WriteLine($"We have {this.Serial.BytesToRead} bytes to read.");
                try {
                    // Construct and write to our managed buffer.
                    byte[] buffer = new byte[this.Serial.BytesToRead];
                    this.Serial.Read(buffer, 0, this.Serial.BytesToRead);

                    // Convert buffer/encode buffer into an ASCII string.
                    // Remove the End Of Line charter. 
                    string content = Encoding.ASCII.GetString(buffer, 0, buffer.Length);

                    Console.Write("Bytes: ");
                    foreach (byte b in buffer)
                    {
                        Console.Write($"{b}");
                    }
                    Console.WriteLine();
                    // Console.WriteLine(String.Format("0x{0:X}", buffer));
                    
                    bool isLastMessageComplete = content[^1] == '\n';

                    var messages = content
                        .Split('\n', StringSplitOptions.RemoveEmptyEntries)
                        .Where(message => !string.IsNullOrWhiteSpace(message))
                        .ToList();

                    // No messages, skip to next cycle.
                    if (!messages.Any()) continue;

                    if (this._partialMessage != null) 
                    {
                        this._partialMessage += messages[0];   
                        // Multiple messages, we have resolved the partial message!                     
                        if (messages.Count > 1) 
                        {
                            Console.ForegroundColor = ConsoleColor.Green;
                            // Console.WriteLine($"Resolved incomplete message using \"{messages[0]}\"");
                            Console.ResetColor();
                            messages[0] = this._partialMessage;
                            this._partialMessage = null;
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
                        Debug.Assert(this._partialMessage == null, "Incomplete message was not completed before new.");
                        this._partialMessage = messages.Last();

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
            else if (_commandQueue.TryDequeue(out var command))
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
        this.Serial.Dispose();
        this.CommunicationThread.Join();
        GC.SuppressFinalize(this);
    }

    public Task<bool> IsConnected()
    {
        throw new NotImplementedException();
    }

    public Task<bool> MoveHead(float x, float y, float z)
    {
        throw new NotImplementedException();
    }
}