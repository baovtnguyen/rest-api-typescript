import jwt, { JwtPayload } from "jsonwebtoken";
import { NextFunction } from "express";
import { CustomRequest, CustomResponse } from "../interfaces/express";

const isAuth = (
  req: CustomRequest,
  res: CustomResponse,
  next: NextFunction,
) => {
  const authHeader: string | undefined = req.get("Authorization");
  if (!authHeader) {
    const err: any = new Error("Not authenticated.");
    err.statusCode = 401;
    throw err;
  }
  const token: string = authHeader.split(" ")[1]; // Bearer ...
  let decodedToken: string | JwtPayload;
  try {
    decodedToken = jwt.verify(token, "somesupersecretsecret");
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  if (!decodedToken) {
    const err: any = new Error("Not authenticated.");
    err.statusCode = 401;
    throw err;
  }
  req.userId = (decodedToken as JwtPayload).userId; // store userId in here
  next();
};

export default isAuth;
