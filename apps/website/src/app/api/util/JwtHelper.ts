//Using jose instead of jsonwebtoken because the NextJS Edge runtime used in middleware file
//does not support most NodeJS API, such as crypto (that jsonwebtoken uses) in order to increase
//performance.
//Jose was made without depending on NodeJS API so it can be used in NextJS Edge runtime
//and also comes with optional encryption

import * as jose from "jose";

import {cookies} from "next/headers";

import { SESSION_COOKIE } from "@/app/api/util/Constants";

export interface UserInfoJwt {
  email: string,
  permission: string
}

export async function makeJwt(email: string, permission: string) {
  return await new jose.SignJWT({
    email: email, 
    permission: permission
  })
  .setProtectedHeader({alg: 'HS256'})
  .setIssuedAt()
  .setExpirationTime('2d')
  .sign(new TextEncoder().encode(process.env.JWT_SECRET!));
}

export async function getJwtPayload() {
  let cookie = cookies().get(SESSION_COOKIE);
  if(!cookie) {
    return null;
  }

  try {
    let payload = (await jose.jwtVerify(cookie.value, new TextEncoder().encode(process.env.JWT_SECRET!))).payload
    return {email: payload.email as string, permission: payload.permission as string};
  } catch(e: any) {
    console.error(e);
    throw new Error("Invalid Token! Log Back In!");
  }
}