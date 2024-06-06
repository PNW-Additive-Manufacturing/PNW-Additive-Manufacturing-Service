![Purdue Northwest 3D Printing Service](https://raw.githubusercontent.com/PNW-Additive-Manufacturing/PNW-3D-Printing-Service/main/assets/front_page.png)

## About the project
The PNW 3D Printing Service enables PNW students, and faculty members to utilize the Additive Manufacturing Club 3D printers through a user-friendly website. When requesting a print, you may decide which filament to be used, it's color, and the infill density configured when sliced. Pricing has yet to be determined. Depends on the filament, and amount used. May reflect how Purdue University operates their 3D Printing Services.

## Maintainer Dashboard
Maintainers of the PNW 3D Printing Service will have the responsibility of maintaining the printers and handling commissions via the Maintainer Dashboard. The Maintainer Dashboard will display a list of all commissions, sorted by their state. Maintainers will be be approve, deny, mark as printing, and archive commissions here.

## Development
Exactly how the PNW 3D Printing Service application will function is undetermined.
Though, a few applications and libraries come to mind:

### How to use
* Start the Database
  * host=localhost port=5432 dbname=postgres user=postgres password=xxxxxxx sslmode=prefer connect_timeout=10
* Navigate to the /apps/website directory
  * cd apps/website
* Start the website
  * npm run dev
* Visit http://localhost:3000/

- When submitting and viewing a commission you'll be able to view the model are you printing utilizing the [ViewSTL library](https://www.viewstl.com/plugin/).
- When viewing the commission while in the `Printing` status a video feed of the print will be embedded using [Mainsail's Crowsnest](https://github.com/mainsail-crew/crowsnest#documentation). *Though, as of writing, I am unsure how to integrate printers that come with webcams to [Crowsnest](https://github.com/mainsail-crew/crowsnest#documentation).*

### Automation
A potentially automated feature utilized by the maintainers of the printers would be starting prints through the [Maintainers Dashboard](#maintainer-dashboard) automatically via the upload G-Code when approved. To obtain this functionality we will need to communicate with the printer. Doing this depends on the MCU, the brain of a 3D printer, and the firmware it is running. For example, a possible implementation may utilize [Moonraker](https://github.com/Arksine/moonraker), a web-api to communicate with an MCU flashed with [Klipper firmware](https://github.com/Klipper3d/klipper). Communication with printers could also bring real-time statistics to a commission such as estimated time remaining, and etc.
### Routing

#### Controlling Printers

```(GET) /api/printers```
Returns the status of all printers.

```(POST) /api/printer/{name}/stop```
Stop printing the selected file.

```(POST) /api/printer/{name}/print?file={fileName}```
Begin printing the selected file.
