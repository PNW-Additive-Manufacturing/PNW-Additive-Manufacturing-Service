import {cookies} from 'next/headers';
import { SESSION_COOKIE, Permission } from '@/app/api/util/Constants';
import { correctPassword, hashAndSaltPassword } from '@/app/api/util/PasswordHelper';
import postgres from 'postgres';
import db from '@/app/api/Database'
import { makeJwt } from "@/app/api/util/JwtHelper";

export async function createAccount(email: string, firstName: string, lastName: string, password: string, permission: string) {
  firstName = firstName.trim();
  lastName = lastName.trim();
  email = email.trim();

  if(!email.endsWith("@pnw.edu")) {
    throw new Error("Please enter your full pnw.edu email!");
  }

  let passwordError = validatePassword(password);
  if(passwordError) {
    throw new Error(passwordError);
  }

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

  await login(email, permission as Permission, firstName, lastName);
}

function validatePassword(password: string) {
  if(password.length < 8) {
    return "Password must be at least 8 characters!";
  }

  if(password.length > 72) {
    return "Password too long!";
  }

  return null;
}

export async function attemptLogin(email: string, password: string) {
  email = email.trim();

  //have login work regardless of whether use signs in as "user" or "user@pnw.edu"
  if(!email.endsWith("@pnw.edu")) {
    email += "@pnw.edu";
  }

  let res: postgres.RowList<postgres.Row[]>;
  try {
    res = await db`select password, permission, firstname, lastname from account where email=${email}`;
  } catch(e) {
    console.error(e);
    throw new Error("Error: Failed to access database!");
  }
  
  if(res.count === 0) {
    throw new Error(`No user exists with email ${email}!`);
  }

  let hash = res[0].password as string;
  let permission = res[0].permission as Permission;
  let firstname = res[0].firstname as string;
  let lastname = res[0].lastname as string;


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

  await login(email, permission, firstname, lastname);
}

export async function login(email: string, permission: Permission, firstname: string, lastname: string) {
  let token = await makeJwt(email, permission, firstname, lastname);

  //session cookie cannot be accessed via client-side javascript, making this safer than
  //just returning the token via JSON response. 
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true, //cannot be accessed via client-side Javascript
    sameSite: "strict", //can only be sent to same website
    secure: false, //TODO: set to true once we have HTTPS connection
  });
}