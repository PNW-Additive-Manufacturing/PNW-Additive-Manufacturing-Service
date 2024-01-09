import { editName, editPassword } from "@/app/api/server-actions/account";
import { getJwtPayload } from "@/app/api/util/JwtHelper";
import GenericFormServerAction from "@/app/components/GenericFormServerAction";
import { Input } from "@/app/components/Input";
export default async function Page() {
  let jwtPayload = await getJwtPayload();

  return (
    <main>

      <div className="w-9/10 m-auto">
        <h1>Your Profile</h1>

        <GenericFormServerAction serverAction={editName} submitName="Edit Name" submitPendingName="Changing Name...">
          <Input label="First Name" type="text" id="firstname" name="firstname" placeholder="First Name" defaultValue={jwtPayload?.firstname}/>
          <Input label="Last Name" type="text" id="lastname" name="lastname" placeholder="Last Name" defaultValue={jwtPayload?.lastname}/>
        </GenericFormServerAction>
        <br/>
        <GenericFormServerAction serverAction={editPassword} submitName="Edit Password" submitPendingName="Changing Account Info">
          <Input label="Current Password" type="password" id="password" name="password" placeholder="Current Password"/>
          <Input label="New Password" type="password" id="new_password" name="new_password" placeholder="New Password"/>
          <Input label="Confirm New Password" type="password" id="confirm_new_password" name="confirm_new_password" placeholder="Confirm New Password"/>
        </GenericFormServerAction>
        </div>
    </main>
  );
}