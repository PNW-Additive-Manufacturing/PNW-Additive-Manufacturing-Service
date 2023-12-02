import jwt, { JwtPayload } from 'jsonwebtoken';
import postgres from 'postgres';
import db from '@/app/api/Database'
import {cookies} from 'next/headers';
import { SESSION_COOKIE } from '@/app/api/util/Constants';


export async function POST(request: Request) {
  let sessionCookie = cookies().get(SESSION_COOKIE);
  if(!sessionCookie) {
    return Response.json({error: "Not Logged In!"});
  }

  let token = sessionCookie.value;

  let email: string;
  try {
    let decodedJWT = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    email = decodedJWT.email;
  } catch(e) {
    //TODO: Check this using MIDDLEWARE so that if an invalid token is received, redirect
    //to the user login page
    return Response.json({error: e});
  }

  let res: postgres.RowList<postgres.Row[]>;
  try {
    res = await db`select * from account where email=${email}`;
  } catch(e) {
    return Response.json({error: "Error: Failed to access database!"});
  }
  
  if(res.count === 0) {
    return Response.json({error: `No user exists with email from JWT!`});
  }

  return Response.json({error: null, userInfo: res});


}