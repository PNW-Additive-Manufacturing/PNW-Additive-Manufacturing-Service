import db from '@/app/api/Database';

import { correctPassword } from '@/app/api/util/PasswordHelper';
import postgres from 'postgres';

export async function POST(request: Request) {
  let reqJson = await request.json();
  
  let {email, password} = reqJson;

  let res: postgres.RowList<postgres.Row[]>;
  try {
    res = await db`select password from account where email=${email}`;
  } catch(e) {
    return Response.json({"error": "Error: Failed to access database!"});
  }
  
  if(res.count === 0) {
    return Response.json({"error": `No user exists with email ${email}!`});
  }



  let hash = res[0].password as string;

  /* Because bcrypt ALWAYS uses 60 character long hashes and 
     our database schema forces all password hashes to be 64 characters (padding with spaces if necessary),
     I need to only take the first 60 characters of the hash from the database
     to ensure that correct passwords will be accepted by the bcrypt compareSync function.
  */
  hash = hash.substring(0,60); 

  let passwordCorrect = correctPassword(password, hash);


  return Response.json({"error": null, "success": passwordCorrect});
}