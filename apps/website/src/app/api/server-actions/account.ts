"use server"
/*
  MUST USE "use server" FOR SERVER ACTIONS.
  Not doing so will result in compilation errors caused from attempting to bundle server
  NPM packages for the client
*/

import { attemptLogin, createAccount } from "@/app/api/util/AccountHelper";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getJwtPayload } from "@/app/api/util/JwtHelper";
import { Permission, SESSION_COOKIE } from "@/app/api/util/Constants";
import { cookies } from "next/headers";

import db from '@/app/api/Database';


/*
  Server Actions for Account-related server stuff
*/

export async function tryLogin(prevState: string, formData: FormData){
  try {
      await attemptLogin(formData.get("email") as string, formData.get("password") as string);
      revalidatePath("/");
  } catch (e: any) {
      //e must be any because Typescript is stupid when it comes to try catch
      return (e as Error).message;
  }

  //note that next redirect will intentionally throw an error in order to start redirecting
  //WARNING: if in a try/catch, it will not work
  let permission = (await getJwtPayload())?.permission;
  //no error checking for Jwt payload since used just logged in
  if(permission == Permission.user) {
    redirect(`/dashboard/user`); 
  }
  else {
    redirect(`/dashboard/maintainer`); 
  }

}

export async function tryCreateAccount(prevState: string, formData: FormData) {
  //if password does not match confirm password, send back error
  if(formData.get("password") as string !== formData.get("confirm-password") as string) {
    return "Password in field does not match Check Password field";
  }

  try {
    await createAccount(
      formData.get("email") as string, 
      formData.get("firstname") as string, 
      formData.get("lastname") as string, 
      formData.get("password") as string,
      "user"
    );
    revalidatePath("/");
  } catch (e: any) {
      //e must be any because Typescript is stupid when it comes to try catch
      return (e as Error).message;
  }

  //use try-catch in case JWT is invalid
  let jwtPayload;
  try {
    jwtPayload = await getJwtPayload();
    if(jwtPayload == null) {
      throw new Error();
    }
  } catch(e) {
    redirect("/user/login");
  }
  //remember not to use redirect in try block unless checking if catch(e) has e.message == "NEXT_REDIRECT"
  redirect(`/dashboard/${jwtPayload.permission}`);

}

export async function logout() {
  console.log("Logout")
  cookies().delete(SESSION_COOKIE);
}

export async function changePermission(prevState: string, formData: FormData): Promise<string> {
  console.log("changing permission")
  let newPermission = formData.get("new-permission") as Permission;
  let userEmail = formData.get("user-email") as string;

  try {
    let res = await db`update account set permission=${newPermission} where email=${userEmail} returning email`;
    if(res.count == 0) {
      throw new Error("Failed to update account!");
    }
  } catch(e) {
    console.error(e);
    return "Failed to update permission on user!";
  }

  return "";
}