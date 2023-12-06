"use server"

import fs from 'fs';
import path from 'path'

import { getJwtPayload } from '@/app/api/util/JwtHelper';

import { redirect } from 'next/navigation';

import db from '@/app/api/Database';

export async function requestPart(prevState: string, formData: FormData) {
  let email: string;
  try {
    email = (await getJwtPayload())!.email;
  } catch(e) {
    return redirect("/user/login");
  }

  let file = formData.get('file') as File | null;
  let notes = formData.get('notes') as string;
  let requestName = formData.get('requestname') as string;
  let color = formData.get('color') as string;
  let material = formData.get('material') as string;
  let quantity = 1;

  if(!file) {
    return "You must submit a .stl file";
  }
  const filename = file.name;

  if(!filename.toLowerCase().endsWith(".stl")) {
    return "The file must be a .stl file";
  }
  
  const buffer = Buffer.from(await file.arrayBuffer());
  const uploadDir = path.join(process.cwd(), "uploads", "stl");

  try {
    if(!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, {recursive: true});
    }
  } catch(e: any) {
    return "Error, server cannot create uploads folder, try again later!";
  } 

  try {
    fs.writeFileSync(`${uploadDir}${path.sep}${filename}`, buffer);
  } catch(e) {
    return "Failed to save file";
  }

  try {
    let success = await db.begin(async (sql) => {
      
      const [requestId] = await sql`insert into request (name, owneremail, notes) values (${requestName}, ${email}, ${notes}) returning id`;

      const [modelId] = await sql`insert into model (name, filepath, owneremail) values (${filename}, ${filename}, ${email}) returning id`;

      const [filamentId] = await sql`select id from filament where color=${color} and material=${material} and instock=true`;
      
      if(!filamentId) {
        throw new Error(`No ${color} ${material} in stock`);
      }

      const partId = await sql`
      insert into part (requestid, modelid, quantity, assignedfilamentid) 
        values (
          ${requestId.id}, ${modelId.id}, ${quantity}, ${filamentId.id}
        ) 
        returning id;
      `;

      return partId.count != 0;
    });

    if(!success) {
      return "Failed to submit part!";
    }
  } catch(e: any) {
    e = e as Error;
    return "Failed to submit part with error message: " + e.message;
  }

  redirect("/dashboard/user");
}