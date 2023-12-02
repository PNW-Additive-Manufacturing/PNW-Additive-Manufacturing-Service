import bcrypt from 'bcrypt';

export function hashAndSaltPassword(password: string): string{
  //note that hashedPassword is always 72 bytes or 60 characters for bcrypt
  const hashedPassword = bcrypt.hashSync(password, 10);

  console.log(correctPassword(password, hashedPassword));
  return hashedPassword;
}

export function correctPassword(plainPassword: string, hash: string): boolean {
  return bcrypt.compareSync(plainPassword, hash);
}