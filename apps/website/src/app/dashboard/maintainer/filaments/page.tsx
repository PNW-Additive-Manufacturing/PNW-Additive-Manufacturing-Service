
import db from "@/app/api/Database";
import { Filament, FilamentList } from "./FilamentTable";
import { Navbar } from "@/app/components/Navigation";
import SidebarNavigation from "@/app/components/DashboardNavigation";
import { RegularCart, RegularCog, RegularCrossCircle } from "lineicons-react";
import Dropdown from "@/app/components/Dropdown";

export default async function Page() {
  let filaments: Filament[] = (await db`select * from filament`).map((f) => {
    return {
      material: f.material,
      color: f.color,
      instock: f.instock
    };
  });

  return (
    <main>
      <Navbar links={[
        {name: "Maintainer Dashboard", path: "/dashboard/maintainer"},
        {name: "Add Filament", path: "/dashboard/maintainer/filaments/addfilament"}
      ]}/>
      <div className='flex flex-col lg:flex-row'>
        <SidebarNavigation style={{height: 'calc(100vh - 72px)'}} items={[
          {
              name: "Orders",
              route: "orders",
              icon: (className) => <RegularCart className={`${className}`}></RegularCart>,
              active: false
          },
          {
              name: "Printers",
              route: "printers",
              icon: (className) => <RegularCog className={`${className}`}></RegularCog>,
              active: false
          },
          {
              name: "Filaments",
              route: "filaments",
              icon: (className) => <RegularCrossCircle className={`${className}`}></RegularCrossCircle>,
              active: true
          }
        ]}></SidebarNavigation>

        <div className='w-full lg:w-2/3 mx-auto p-12 overflow-y-scroll' style={{height: 'calc(100vh - 72px)'}}>
          <Dropdown name="Filament" collapsible={false}>
            <FilamentList initialFilaments={filaments}/>
          </Dropdown>
        </div>
      
      </div>
    </main>
  )
}