import fs from "fs";
import path from "path";

const uploadDir = path.join(process.cwd(), "uploads", "stl");

export async function getFile(name: string): Promise<Buffer | null> {
	let buffer = fs.readFileSync(path.join(uploadDir, name));

	if (!buffer) {
		return null;
	}
	return buffer;
}
