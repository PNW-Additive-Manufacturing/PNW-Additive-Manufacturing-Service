![Purdue Northwest Additive Manufacturing Service](https://raw.githubusercontent.com/PNW-Additive-Manufacturing/PNW-3D-Printing-Service/main/assets/front_page.png)

## About the project
The PNW Additive Manufacturing Service enables PNW students, and faculty members to utilize the Additive Manufacturing Club 3D printers through a user-friendly website. When requesting a print, you may decide which filament to be used, it's color, and the infill density configured when sliced. Pricing has yet to be determined. Depends on the filament, and amount used.

## Requirements before Deployment
You may visit the pre-production version of this service at https://pnw3d.com. Payment is in testing mode, you will not be charged for any balance.

- [ ] Integrate payment system with PNW payment systems.

## How to use
* Start PostgreSQL
  * Execute the database.sql file on the database. 
* Configure the enviroment variables with .env.example. 
* Start the website
  * Install yarn using `npm install -g yarn`
  * Install required packages using `yarn install`
  * Run `yarn run dev`
* Visit http://localhost:3000/

- When submitting and viewing a commission you'll be able to view the model are you printing utilizing the [ViewSTL library](https://www.viewstl.com/plugin/).
- When viewing the commission while in the `Printing` status a video feed of the print will be embedded using [Mainsail's Crowsnest](https://github.com/mainsail-crew/crowsnest#documentation). *Though, as of writing, I am unsure how to integrate printers that come with webcams to [Crowsnest](https://github.com/mainsail-crew/crowsnest#documentation).*

### Stripe Payments
While developing, use the Stripe CLI to forward events/triggers to your local machine. Set STRIPE_SECRET.
```
stripe listen --forward-to http://localhost:3000/api/hooks/stripe
```
