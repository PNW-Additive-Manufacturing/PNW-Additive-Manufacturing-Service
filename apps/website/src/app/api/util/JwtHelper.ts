import jwt, { JwtPayload } from "jsonwebtoken";
import {cookies} from "next/headers";

import { SESSION_COOKIE } from "@/app/api/util/Constants";

export interface UserInfoJwt {
  email: string,
  permission: string
}

export function makeJwt(email: string, permission: string) {
  return jwt.sign(
    {
      email: email, 
      permission: permission
    }, 
    process.env.JWT_SECRET!, 
    {expiresIn: '30d'}
  );
}

export function getJwtPayload() {
  let cookie = cookies().get(SESSION_COOKIE);
  if(!cookie) {
    return null;
  }

  try {
    let payload = jwt.verify(cookie.value!, process.env.JWT_SECRET!) as JwtPayload;
    return {email: payload.email, permission: payload.permission};
  } catch(e: any) {
    throw new Error("Invalid Token! Log Back In!");
  }
}