"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const user_model_1 = require("../models/user.model");
class AuthController {
}
exports.default = AuthController;
AuthController.signUp = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = express_validator_1.validationResult(req);
        if (!errors.isEmpty()) {
            const err = new Error("Validation failed.");
            err.statusCode = 402;
            err.data = errors.array();
            throw err;
        }
        const { email } = req.body;
        const { name } = req.body;
        const { password } = req.body;
        const hashedPassword = yield bcryptjs_1.default.hash(password, 12);
        const user = new user_model_1.User({
            email,
            password: hashedPassword,
            name,
        });
        const newUser = yield user.save();
        res.status(201).json({
            message: "User created!",
            userId: newUser._id,
        });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
});
AuthController.login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const { password } = req.body;
    try {
        const user = yield user_model_1.User.findOne({ email });
        if (!user) {
            const err = new Error("A user with this email could not be found.");
            err.statusCode = 401;
            throw err;
        }
        const loadedUser = user;
        const isEqual = yield bcryptjs_1.default.compare(password, user.password);
        if (!isEqual) {
            const err = new Error("Wrong password!");
            err.statusCode = 401;
            throw err;
        }
        const token = jsonwebtoken_1.default.sign({
            email: loadedUser.email,
            userId: loadedUser._id.toString(),
        }, "somesupersecretsecret", { expiresIn: "1h" });
        res.status(200).json({
            token,
            userId: loadedUser._id.toString(),
        });
        return;
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
        return err;
    }
});
AuthController.getUserStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.User.findById(req.userId);
        if (!user) {
            const err = new Error("User not found.");
            err.statusCode = 404;
            throw err;
        }
        res.status(200).json({ status: user.status });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
});
AuthController.updateUserStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const newStatus = req.body.status;
    try {
        const user = yield user_model_1.User.findById(req.userId);
        if (!user) {
            const err = new Error("User not found.");
            err.statusCode = 404;
            throw err;
        }
        user.status = newStatus;
        yield user.save();
        res.status(200).json({ message: "User updated." });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
});
