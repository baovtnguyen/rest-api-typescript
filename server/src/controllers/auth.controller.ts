import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import { NextFunction } from "express";

import { CustomRequest, CustomResponse } from "../interfaces/express";
import { User } from "../models/user.model";

export default class AuthController {
  static signUp = async (
    req: CustomRequest,
    res: CustomResponse,
    next: NextFunction,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const err: any = new Error("Validation failed.");
        err.statusCode = 402;
        err.data = errors.array();
        throw err;
      }
      const { email } = req.body;
      const { name } = req.body;
      const { password } = req.body;
      const hashedPassword: string = await bcrypt.hash(password, 12);
      const user = new User({
        email,
        password: hashedPassword,
        name,
      });
      const newUser = await user.save();
      res.status(201).json({
        message: "User created!",
        userId: newUser._id,
      });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  };

  static login = async (
    req: CustomRequest,
    res: CustomResponse,
    next: NextFunction,
  ) => {
    const { email } = req.body;
    const { password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        const err: any = new Error(
          "A user with this email could not be found.",
        );
        err.statusCode = 401;
        throw err;
      }
      const loadedUser = user;
      const isEqual: boolean = await bcrypt.compare(password, user.password);
      if (!isEqual) {
        const err: any = new Error("Wrong password!");
        err.statusCode = 401;
        throw err;
      }
      const token: string = jwt.sign(
        {
          email: loadedUser.email,
          userId: loadedUser._id.toString(),
        },
        "somesupersecretsecret",
        { expiresIn: "1h" },
      );
      res.status(200).json({
        token,
        userId: loadedUser._id.toString(),
      });
      return;
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
      return err;
    }
  };

  static getUserStatus = async (
    req: CustomRequest,
    res: CustomResponse,
    next: NextFunction,
  ) => {
    try {
      const user = await User.findById(req.userId);
      if (!user) {
        const err: any = new Error("User not found.");
        err.statusCode = 404;
        throw err;
      }
      res.status(200).json({ status: user.status });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  };

  static updateUserStatus = async (
    req: CustomRequest,
    res: CustomResponse,
    next: NextFunction,
  ) => {
    const newStatus: string = req.body.status;
    try {
      const user = await User.findById(req.userId);
      if (!user) {
        const err: any = new Error("User not found.");
        err.statusCode = 404;
        throw err;
      }
      user.status = newStatus;
      await user.save();
      res.status(200).json({ message: "User updated." });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  };
}
