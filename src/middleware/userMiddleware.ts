import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";

const userSecret = "s3cret"; 

export function userMiddleware(req: any, res: Response, next: NextFunction) {
  const token = req.headers.token;

  if (!token) {
    return;
  }

  try {
    const decoded:any = verify(token, userSecret); 
    req.userId = decoded._id;
    next();
  } catch (err) {
     return;
  }
}

