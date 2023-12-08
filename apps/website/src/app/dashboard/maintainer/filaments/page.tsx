
import db from "@/app/api/Database";
import { Filament, FilamentList } from "./FilamentTable";
import { Navbar } from "@/app/components/Navigation";

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

      <FilamentList initialFilaments={filaments}/>
    </main>
  )
}