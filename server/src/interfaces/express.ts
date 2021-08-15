import { Request, Response } from "express";

export type CustomRequest = Request & {
  userId?: string;
  file?: any;
};

export type CustomResponse = Response & {};
