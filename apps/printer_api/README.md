# Unified Printer API

Utilizing [Printer Interop](https://github.com/PNW-Additive-Manufacturing/PrinterInterop), strangle multiple brands/models of printers into a singular unified-communication model.

## Getting Started

1. Create a configuration file named `printers.json` in the current directory.
2. Using [Printer Interop Communication Strategies](https://github.com/PNW-Additive-Manufacturing/PrinterInterop/tree/main/PrinterInterop/Communication), populate your communication method per-printer.

For example, this is a config connected to a Ender 3 V2 running Klipper.

```json
[
    {
        "Name": "Ender 3 V2",
        "CommunicationStrategy": "moonraker",
        "CommunicationOptions": {
            "Host": "http://192.168.8.172:8080"
        }
    }
]
```

3. Finally, start the api using `dotnet run`

## Routes

<!-- After you have applied your printer configurations, you may utilize a plethora of endpoints to interact with your printers. -->

```
(GET) /printers
```

> **Query Configured Printers** - More information may be obtained querying individually.

Response:

```tsx
[
    {
        // Whether or not the connection is healthy.
        isConnected: boolean,

        // The name of the printer.
        name: string,
    }
]
```

---

```
(GET) /printer/{name}
```

> **Query Printer Information** - Queries information on the given printer.

Response:

```tsx
{
    // Whether or not the connection is healthy.
    isConnected: boolean,

    // The name of the printer.
    name: string,

    // The status of the printer.
    status: any
}
```

<!-- Will be used later -->
<!-- ```tsx
// // The state or the printer.
    // state: "idle" | "paused" | "printing" | "failed" = "printing",
    // // Printing error message. Visible when in a failed state.
    // printingError: string | NULL, 
    // // An XYZ position of the toolhead.
    // toolPosition: [int, int, int] = [150, 150, 20],
    // // A percentage of the progress of the current print.
    // progression: number = 50,
    // // The name of the selected file.
    // selectedFile: string | NULL = "cube.gcode",
    // // The estimated completion time reflecting ISO 8601.
    // completionTime: string = "2023-011-23T18:25:43.511Z",
    // // The temperatures of each heating element. These can be set.
    // temperatures: { [key: string]: int } = 
    // {
    //     "extruder": 200,
    //     "bed": 60
    // },
``` -->

---

```
(GET) /configuration
```

> **Query Configuration** - Retrieve the current configuration of the api.

---

```
(POST) /configuration
```

> **Update Configuration** - Update the config remotely, send the config in the body of the request.

> [!NOTE]
> Updating the configuration may take a few moments.


<!-- ```(POST) /printer/{name}/stop```

> Stop and clear the running print.

```(POST) /printer/{name}/pause```

> Pause the running print.

```(POST) /printer/{name}/resume```

> Resume the current print.

```(POST) /printer/{name}/run?fileName="cube.gcode"```

> Select and begin a print.

```(POST) /printer/{name}/upload```

> LAMA

```(POST) /printer/{name}/move_tool```

> [!IMPORTANT]
> This may return an unsupported error code.

### Set Heater Temperatures

```
(POST) /printer/{name}/heat
```

> Set the temperature of each heating element.

> [!NOTE]
> Heating elements are returned when querying information on the printer.
> For example, these include: `extruder` and `bed`.

Payload:

A collection of temperatures associated to their element.  

```tsx
{
    [key: string]: int
}
```

### Reconnect to Printer after Disconnected

```POST /printer/{name}/reconnect``` -->
