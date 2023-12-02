import db from '@/app/api/Database';

import { hashAndSaltPassword } from '@/app/api/util/PasswordHelper';
import postgres from 'postgres';

export async function POST(request: Request) {
  let reqJson = await request.json();
  
  let {email, password, firstname, lastname, permission} = reqJson;
  
  let hash = hashAndSaltPassword(password);

  let res: postgres.RowList<postgres.Row[]>;
  try {
    res = await db`insert into account (email, firstname, lastname, password, permission)
    values (${email}, ${firstname}, ${lastname}, ${hash}, ${permission})`;
  } catch(e) {
    return Response.json({"error": "Error: Failed to add new user!"});
  }
  
  if(res.count === 0) {
    return Response.json({"error": "Failed to add new user!"});
  }

  return Response.json({"error": null, "success": true});
}