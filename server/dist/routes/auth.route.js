"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const check_1 = require("express-validator/check");
const user_model_1 = require("../models/user.model");
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
const is_auth_mdw_1 = __importDefault(require("../middlewares/is-auth.mdw"));
const router = express_1.Router();
router.put("/signup", [
    check_1.body("email")
        .trim()
        .isEmail()
        .withMessage("Please enter a valid email.")
        .custom((value) => {
        return user_model_1.User.findOne({ email: value }).then((userDoc) => {
            if (userDoc) {
                return Promise.reject("E-mail address already exists!");
            }
        });
    })
        .normalizeEmail(),
    check_1.body("password").trim().isLength({ min: 5 }),
    check_1.body("name").trim().not().isEmpty(),
], auth_controller_1.default.signUp);
router.post("/login", auth_controller_1.default.login);
router.get("/status", is_auth_mdw_1.default, auth_controller_1.default.getUserStatus);
router.patch("/status", is_auth_mdw_1.default, [check_1.body("status").trim().not().isEmpty()], auth_controller_1.default.updateUserStatus);
exports.default = router;
