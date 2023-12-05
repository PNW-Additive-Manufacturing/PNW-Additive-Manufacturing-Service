import jwt from 'jsonwebtoken';
import {cookies} from 'next/headers';
import { SESSION_COOKIE, Permission } from '@/app/api/util/Constants';
import { correctPassword, hashAndSaltPassword } from '@/app/api/util/PasswordHelper';
import postgres from 'postgres';
import db from '@/app/api/Database'
import { makeJwt, getJwtPayload } from "@/app/api/util/JwtHelper";

export async function createAccount(email: string, firstName: string, lastName: string, password: string, permission: string) {
  let hash = hashAndSaltPassword(password);

  let res: postgres.RowList<postgres.Row[]>;
  try {
    res = await db`insert into account (email, firstname, lastname, password, permission)
    values (${email}, ${firstName}, ${lastName}, ${hash}, ${permission})`;
  } catch(e: any) {
    e = e as Error;
    //Postgres error code for duplicate entry is 23505 (user already exists)
    if(e.code == 23505) {
      throw new Error(`User ${email} already exists!`)
    }
    
    console.error(e);
    //throw user friendly error to client
    throw new Error("Failed to add new user!");
  }
  
  if(res.count === 0) {
    throw new Error("Failed to add new user!");
  }



  login(email, permission as Permission);
}

export async function attemptLogin(email: string, password: string) {
  let res: postgres.RowList<postgres.Row[]>;
  try {
    res = await db`select password, permission from account where email=${email}`;
  } catch(e) {
    console.error(e);
    throw new Error("Error: Failed to access database!");
  }
  
  if(res.count === 0) {
    throw new Error(`No user exists with email ${email}!`);
  }

  let hash = res[0].password as string;
  let permission = res[0].permission as Permission;

  /* Because bcrypt ALWAYS uses 60 character long hashes and 
     our database schema forces all password hashes to be 64 characters (padding with spaces if necessary),
     I need to only take the first 60 characters of the hash from the database
     to ensure that correct passwords will be accepted by the bcrypt compareSync function.
  */
  hash = hash.substring(0,60); 

  let passwordCorrect = correctPassword(password, hash);

  if(!passwordCorrect) {
    throw new Error("Incorrect Password!");
  }

  login(email, permission);
}

export function login(email: string, permission: Permission) {
  let token = makeJwt(email, permission);

  //session cookie cannot be accessed via client-side javascript, making this safer than
  //just returning the token via JSON response. 
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true, //cannot be accessed via client-side Javascript
    sameSite: "strict", //can only be sent to same website
    secure: false, //TODO: set to true once we have HTTPS connection
  });
}