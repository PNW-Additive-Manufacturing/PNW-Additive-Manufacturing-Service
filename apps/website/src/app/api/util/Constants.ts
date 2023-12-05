export const SESSION_COOKIE = "session-token";

//because getting names of enums would otherwise require us to do
// Permission[Permission.user] to get "user"
export enum Permission {
  user = "user",
  maintainer = "maintainer",
  admin = "admin"
}