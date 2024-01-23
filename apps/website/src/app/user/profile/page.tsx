import { getJwtPayload } from "@/app/api/util/JwtHelper";
import EditPage from "./MainPage";

export default async function Page() {
  let jwtPayload = await getJwtPayload();

  return <EditPage userInfo={{firstname: jwtPayload ? jwtPayload.firstname : "", lastname: jwtPayload ? jwtPayload.lastname : ""}}/>
}