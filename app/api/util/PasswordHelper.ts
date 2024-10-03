import bcrypt from "bcrypt";

export function hashAndSaltPassword(password: string): string {
	//note that hashedPassword is always 60 characters for bcrypt and that plaintext password must be
	//at most 72 characters
	const hashedPassword = bcrypt.hashSync(password, 10);

	return hashedPassword;
}

export function correctPassword(plainPassword: string, hash: string): boolean {
	return bcrypt.compareSync(plainPassword, hash);
}
