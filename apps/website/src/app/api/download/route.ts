import { getFile } from "@/app/api/server-actions/download";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  console.log(request.url)
  let filepath = request.url.substring(request.url.lastIndexOf("?file=") + 6);


  if(!filepath) {
    return NextResponse.json({error: "No filename provided!", file: null});
  }

  let file = await getFile(filepath);

  if(!file) {
    return NextResponse.json({error: "No file found!", file: null});
  }

  return new NextResponse(file, {
    headers: {
      'Content-Type': "model/stl",
      'Content-Disposition': `attachment; filename=${filepath}`
    }, 
  });
  

}