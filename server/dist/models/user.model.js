"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: "I am very new!",
    },
    posts: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            required: true,
            ref: "Post",
        },
    ],
});
exports.User = mongoose_1.model("User", userSchema);
