import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";

const userSecret = "s3cret"; 

export function userMiddleware(req: any, res: Response, next: NextFunction) {
  const token = req.headers.token;
  console.log(req.headers)
  if (!token) {
    res.status(401).json({ error: "Token is required" });
    return;
  }
  
  try {
    const decoded:any = verify(token, userSecret); 
    req.userId = decoded.userId;
    next();
  } catch (err) {
     return;
  }
}

