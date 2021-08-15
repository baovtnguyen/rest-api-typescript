import { Router } from "express";
import { body } from "express-validator/check";

import { User } from "../models/user.model";
import AuthController from "../controllers/auth.controller";
import isAuth from "../middlewares/is-auth.mdw";

const router = Router();

router.put(
  "/signup",
  [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value: string) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("E-mail address already exists!");
          }
        });
      })
      .normalizeEmail(),
    body("password").trim().isLength({ min: 5 }),
    body("name").trim().not().isEmpty(),
  ],
  AuthController.signUp,
);

router.post("/login", AuthController.login);

router.get("/status", isAuth, AuthController.getUserStatus);

router.patch(
  "/status",
  isAuth,
  [body("status").trim().not().isEmpty()],
  AuthController.updateUserStatus,
);

export default router;
