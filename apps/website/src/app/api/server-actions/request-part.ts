"use server"

import fs from 'fs';
import path from 'path'

import { getJwtPayload } from '@/app/api/util/JwtHelper';
import { redirect } from 'next/navigation';

import db from '@/app/api/Database';

const uploadDir = path.join(process.cwd(), "uploads", "stl");


export async function getFilamentList() {
  let filaments = await db`select material, color from filament where instock=true`;

  let rtn: {material: string, color: string}[] = [];

  for(let filament of filaments) {
    rtn.push({material: filament.material, color: filament.color});
  }

  return rtn;
}

export async function requestPart(prevState: string, formData: FormData) {
  console.log("Requesting Part");
  let email: string;
  try {
    email = (await getJwtPayload())!.email;
  } catch(e) {
    return redirect("/user/login");
  }


  let files = formData.getAll('file') as File[] | null;
  let notes = formData.get('notes') as string;
  let requestName = formData.get('requestname') as string;
  let color = formData.getAll('color') as string[];
  let material = formData.getAll('material') as string[];
  let quantity = formData.getAll("quantity") as string[];

  console.log(files);
  console.log(color);
  console.log(material);
  console.log(quantity);

  if(files == null) {
    return "You must submit one or more .stl files";
  }

  let filepaths = files.map(f => f.name);

  let nonStlFile = filepaths.find((path) => !path.toLowerCase().endsWith(".stl"));
  if(nonStlFile) {
    return `The file ${nonStlFile} must be a .stl file`;
  }

  let filenames = filepaths.map(path => path.substring(0, path.lastIndexOf(".")));
  
  try {
    if(!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, {recursive: true});
    }
  } catch(e: any) {
    return "Error, server cannot create uploads folder, try again later!";
  } 

  //write all files to upload folder
  try {
    for(let i = 0; i < files.length; i++) {
      const buffer = Buffer.from(await files[i].arrayBuffer());
      fs.writeFileSync(`${uploadDir}${path.sep}${filenames[i]}.stl`, buffer);
    }
  } catch(e) {
    return "Failed to save file with error: " + e;
  }

  //update database 
  try {
    let success = await db.begin(async (sql) => {
      
      const [requestId] = await sql`insert into request (name, owneremail, notes) values (${requestName}, ${email}, ${notes}) returning id`;

      for(let i = 0; i < files!.length; i++) {
        // TODO: Replace separate filament queries with singular.
        const filamentId = await sql`select id from filament where color=${color[i]} and material=${material[i]} and instock=true`;

        //if no filament with matching color and material was found,
        //check if the user specified the 'Other' option in the web page (empty string == other)
        if(filamentId.length === 0 && color && material) {
          throw new Error(`No ${color} ${material} in stock`);
        }

        const [modelId] = await sql`insert into model (name, filepath, owneremail) values (${filenames[i]}, ${filenames[i] + ".stl"}, ${email}) returning id`;

        const partId = await sql`
          insert into part (requestid, modelid, quantity, assignedfilamentid) 
          values (
            ${requestId.id}, ${modelId.id}, ${quantity[i]}, ${!filamentId ? null : filamentId[0].id}
          ) 
          returning id;
        `;

        if(partId.count == 0) {
          throw new Error(`Failed to insert part: #${i}!`);
        }
      }

      return true;
    });

    if(!success) {
      return "Failed to submit parts!";
    }
  } catch(e: any) {
    e = e as Error;
    return "Failed to submit part with error message: " + e.message;
  }

  redirect("/dashboard/user");
}