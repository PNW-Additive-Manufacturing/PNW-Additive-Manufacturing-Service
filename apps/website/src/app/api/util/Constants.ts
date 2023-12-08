import postgres from "postgres"

export const SESSION_COOKIE = "session-token";

//because getting names of enums would otherwise require us to do
// Permission[Permission.user] to get "user"
export enum Permission {
  user = "user",
  maintainer = "maintainer",
  admin = "admin"
}

export interface Request {
  id: number,
  name: string,
  date: Date,
  isFulfilled: boolean
}

export interface Part {
  partid: number,
  requestid: number,
  modelid: number,
  quantity: number,
  status: string,
  modelname: string,
  filamentmaterial: string,
  filamentcolor: string
}