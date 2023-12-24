import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

import { getJwtPayload } from "./app/api/util/JwtHelper";
import { Permission, SESSION_COOKIE } from "./app/api/util/Constants";


//all root level files allowed to be accessed without logging in
const ROOT_FOLDER_FILE_WHITELIST = [
  '/favicon.ico',
  '/robots.txt',
];

const USER_BLACKLIST = [
  "/api"
];

export async function middleware(request: NextRequest) {
  const nextUrl = request.nextUrl.pathname;

  //allow non-logged in users to access login and create account screens
  if(nextUrl.startsWith("/user/login") || nextUrl.startsWith("/user/create-account") || nextUrl === "/") {
    return NextResponse.next();
  }

  //because this is the only way NextJS will allow me to delete cookies before 
  //a GET request to /logout is completed, the logout feature is here.
  //I could use an API endpoint, but I would prefer to not have both /logout and /api/logout routes
  if(nextUrl.startsWith("/user/logout")) {
    // cookies().delete(SESSION_COOKIE);
    let res = NextResponse.next();
    //delete session cookie from response.
    res.cookies.delete(SESSION_COOKIE);
    return res;
    //return NextResponse.redirect(new URL("/", request.url));
  }

  //all assets, nextjs stuff, are allowed
  if(nextUrl.startsWith("/assets") || nextUrl.startsWith("/_next")) {
    return NextResponse.next();
  }

  //all whitelisted files in root folder are allowed
  if(ROOT_FOLDER_FILE_WHITELIST.find((item) => item == nextUrl)) {
    return NextResponse.next();
  }

  //check if JWT exists and is valid
  let jwtPayload: {email: string, permission: string} | null;
  try {
    jwtPayload = await getJwtPayload();
    if(jwtPayload == null) {
      throw new Error("No JWT Exists");
    }
  } catch(e) {
    console.log(e);
    console.log("Redirect to login");
    //if JWT does not exist or is invalid
    return NextResponse.redirect(new URL("/user/login", request.url));
  }
  
  let permission = jwtPayload.permission as Permission;

  //automatically force redirect to correct dashboard
  if(nextUrl.startsWith(`/dashboard/${Permission.maintainer}`) && permission == Permission.user) {
    return NextResponse.redirect(new URL(`/dashboard/${Permission.user}`, request.url));
  }

  //automatically force redirect to correct dashboard
  if(((nextUrl.startsWith(`/dashboard/maintainer/printers`)) || (nextUrl.startsWith(`/dashboard/maintainer/users`))) && permission !== Permission.admin) {
    return NextResponse.redirect(new URL(`/dashboard/${permission}`, request.url));
  }

  //don't allow user to access API
  if(permission == Permission.user && USER_BLACKLIST.find((url) => nextUrl.startsWith(url))) {
    return NextResponse.redirect(new URL(`/dashboard/${Permission.user}`, request.url));
  }
  
  //continue to current URL without issues
  return NextResponse.next();
}