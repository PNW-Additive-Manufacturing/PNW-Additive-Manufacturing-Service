# Printer Interoperability

Manages abstract communication between multiple models of printers.

> [!WARNING]
> This package is likely to be updated frequency without notice.

## Supported Systems

This library integrates multiple [Communication Strategies](/PrinterInterop/Communication). These strategies implement a communication abstraction following the [ICommunicationStrategy](/PrinterInterop/Communication/ICommunicationStrategy.cs).

- [x] Moonraker ***(Partially Implemented)***
- [ ] Serial
- [ ] Bambu Cloud
- [ ] Bambu Lan

## Other Information

Examples of each communication strategy can be viewed in [examples](/Examples/).
