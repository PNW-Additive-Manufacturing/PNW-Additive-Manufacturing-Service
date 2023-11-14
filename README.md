# Purdue Northwest 3D Printing Service

The PNW 3D Printing Service enables PNW students, and faculty members to utilize the Additive Manufacturing Club 3D printers through a user-friendly website. When requesting a print, you may decide which filament to be used, it's color, and the infill density configured when sliced.

After submission, you will be redirected to a page displaying the id and status of your commission. The status of a commission will include the following states: `Pending Approval, Denied, Queued, Printing, Printed, Failed, and Fulfilled`. You can imagine the commission id as a UPS tracking number - enabling you to check the status of said commission at a later date.

| Commission State | Description |
| ----------------- | ----------- |
| Pending Approval | Model is pending for review. If accepted, model is sliced and changed to `Queued` or `Printing` status. |
| Denied | Model may not reliably printable, too big to print, or NSFW. An explanation will be provided. |
| Queued | Model is waiting to be printed. A queue position will be displayed when viewing the status. |
| Printing | The print is underway, and can be monitored by the webcam. |
| Printed | Model has been printed and is waiting for pickup. |
| Failed | Model could not be successfully printed after several attempts.  |
| Fulfilled | Finished print has been picked up, fulfilling the commission. |

## Structure

### Database
* Account
    * Email [Primary]
    * First Name
    * Last Name
    * Password
    * Permission
        * User
            * Submits Requests
            * View Request Status
        * Maintainer
            * View/Update Requests
            * View/Update Files
            * Manage Printers
            * Manage Filament
        * Admin
            * Manage Users
    * VerificationId
* Request
    * Id [Primary]
    * Name
    * OwnerEmail [Ref]
    * SubmitTime
    * IsFullfilled
    * Notes
* Part
    * Id [Primary]
    * RequestId [Ref]
    * ModelId [Ref]
    * Quantity
    * Status
    * PrinterName [Ref]
    * FilamentId
* Model
    * Id [Primary]
    * Name
    * OwnerEmail [Ref]
    * FilePath
    * ThumbnailPath
* Printer
    * Name [Primary]
    * Model
    * Dimensions
    * Filaments
    * OutOfOrder
    * Queue (List)
* Filament
    * Id [Primary]
    * Material
    * Color
    * InStock

### Server Files
* STL
* Gcode

### API
* Layer between components

### Website
* Requests
    * Create
    * View
* Dashboard
    * Printer Status
    * Request Status

## Pricing

Has yet to be determined. Depends on the filament, and amount used. May reflect how Purdue University operates their 3D Printing Services.

## Maintainer Dashboard

Maintainers of the PNW 3D Printing Service will have the responsibility of maintaining the printers and handling commissions via the Maintainer Dashboard. The Maintainer Dashboard will display a list of all commissions, sorted by their state. Maintainers will be be approve, deny, mark as printing, and archive commissions here.

## Development

Exactly how the PNW 3D Printing Service application will function is undetermined.
Though, a few applications and libraries come to mind:

- When submitting and viewing a commission you'll be able to view the model are you printing utilizing the [ViewSTL library](https://www.viewstl.com/plugin/).
- When viewing the commission while in the `Printing` status a video feed of the print will be embedded using [Mainsail's Crowsnest](https://github.com/mainsail-crew/crowsnest#documentation). *Though, as of writing, I am unsure how to integrate printers that come with webcams to [Crowsnest](https://github.com/mainsail-crew/crowsnest#documentation).*

### Automation

A potentially automated feature utilized by the maintainers of the printers would be starting prints through the [Maintainers Dashboard](#maintainer-dashboard) automatically via the upload G-Code when approved. To obtain this functionality we will need to communicate with the printer. Doing this depends on the MCU, the brain of a 3D printer, and the firmware it is running. For example, a possible implementation may utilize [Moonraker](https://github.com/Arksine/moonraker), a web-api to communicate with an MCU flashed with [Klipper firmware](https://github.com/Klipper3d/klipper). Communication with printers could also bring real-time statistics to a commission such as estimated time remaining, and etc.
