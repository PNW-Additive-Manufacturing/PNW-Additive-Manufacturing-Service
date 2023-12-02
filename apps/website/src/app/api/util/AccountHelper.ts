import jwt from 'jsonwebtoken';
import {cookies} from 'next/headers';
import { SESSION_COOKIE } from '@/app/api/util/Constants';



export function login(email: string) {
  let token = jwt.sign({email: email}, process.env.JWT_SECRET!, {expiresIn: '30d'});

  //session cookie cannot be accessed via client-side javascript, making this safer than
  //just returning the token via JSON response. 
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true, //cannot be accessed via client-side Javascript
    sameSite: "strict", //can only be sent to same website
    secure: false, //TODO: set to true once we have HTTPS connection
  });
}