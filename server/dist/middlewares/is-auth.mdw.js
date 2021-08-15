"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const isAuth = (req, res, next) => {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
        const err = new Error("Not authenticated.");
        err.statusCode = 401;
        throw err;
    }
    const token = authHeader.split(" ")[1]; // Bearer ...
    let decodedToken;
    try {
        decodedToken = jsonwebtoken_1.default.verify(token, "somesupersecretsecret");
    }
    catch (err) {
        err.statusCode = 500;
        throw err;
    }
    if (!decodedToken) {
        const err = new Error("Not authenticated.");
        err.statusCode = 401;
        throw err;
    }
    req.userId = decodedToken.userId; // store userId in here
    next();
};
exports.default = isAuth;
