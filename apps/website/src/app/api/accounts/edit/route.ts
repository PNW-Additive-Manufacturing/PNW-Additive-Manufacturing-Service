import jwt, { JwtPayload } from 'jsonwebtoken';
import postgres from 'postgres';
import db from '@/app/api/Database'

export async function POST(request: Request) {
  let reqJson = await request.json();
  
  let {newEmail, token} = reqJson;

  let email: string;
  try {
    let decodedJWT = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    email = decodedJWT.email;
  } catch(e) {
    return Response.json({error: e, success: false});
  }

  let res: postgres.RowList<postgres.Row[]>;
  try {
    res = await db`update account set email=${newEmail} where email=${email}`;
  } catch(e) {
    return Response.json({error: "Error: Failed to access database!"});
  }
  
  if(res.count === 0) {
    return Response.json({error: `No user exists with email from JWT!`});
  }

  return Response.json({error: null, success: true})


}