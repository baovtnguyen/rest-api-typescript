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
const socket_1 = __importDefault(require("../socket"));
const express_validator_1 = require("express-validator");
const user_model_1 = require("../models/user.model");
const post_model_1 = require("../models/post.model");
const s3Client_1 = require("../s3Client");
class FeedController {
}
exports.default = FeedController;
FeedController.getPosts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const currentPage = req.query.page || 1;
    const perPage = 2;
    try {
        const totalItems = yield post_model_1.Post.find().countDocuments();
        const posts = yield post_model_1.Post.find()
            .populate({ path: "creator", model: user_model_1.User })
            .sort({ createdAt: -1 })
            .skip((+currentPage - 1) * perPage)
            .limit(perPage);
        res.status(200).json({
            message: "Fetched posts successfully.",
            posts,
            totalItems,
        });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500; // server-side error
        }
        next(err);
    }
    // ...
});
FeedController.createPost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = express_validator_1.validationResult(req);
        if (!errors.isEmpty()) {
            const err = new Error("Validation failed entered data is incorrect.");
            err.statusCode = 422;
            throw err;
        }
        if (!req.file) {
            const err = new Error("No image provided.");
            err.statusCode = 422;
            throw err;
        }
        // const imageUrl: string = req.file.path.replace(/\\/g, '/');
        const imageUrl = req.file.key;
        const { title } = req.body;
        const { content } = req.body;
        const post = new post_model_1.Post({
            title,
            content,
            imageUrl,
            creator: req.userId,
        });
        yield post.save();
        const user = (yield user_model_1.User.findById(req.userId));
        user.posts.push(post);
        yield user.save();
        // inform all other users
        socket_1.default.getIO().emit("posts", {
            action: "create",
            post: Object.assign(Object.assign({}, post._doc), { creator: { _id: req.userId, name: user.name } }),
        });
        res.status(201).json({
            message: "Post created successfully!",
            post,
            creator: { _id: user._id, name: user.name },
        });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500; // server-side error
        }
        next(err);
    }
});
FeedController.getPost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId } = req.params;
    try {
        const post = (yield post_model_1.Post.findById({ _id: postId }).populate({
            path: "creator",
            model: user_model_1.User,
        }));
        if (!post) {
            const err = new Error("Could not find post.");
            err.statusCode = 404;
            throw err;
        }
        res.status(200).json({ message: "Post fetched.", post });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500; // server-side error
        }
        next(err);
    }
});
FeedController.updatePost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = express_validator_1.validationResult(req);
        if (!errors.isEmpty()) {
            const err = new Error("Validation failed entered data is incorrect.");
            err.statusCode = 422;
            throw err;
        }
        const { postId } = req.params;
        const { title } = req.body;
        const { content } = req.body;
        let imageUrl = req.body.image;
        if (req.file) {
            // imageUrl = req.file.path.replace(/\\/g, '/');
            imageUrl = req.file.key;
        }
        if (!imageUrl) {
            const err = new Error("No file picked.");
            err.statusCode = 402;
            throw err;
        }
        const post = (yield post_model_1.Post.findById(postId).populate({
            path: "creator",
            model: user_model_1.User,
        }));
        if (!post) {
            const err = new Error("Could not find post.");
            err.statusCode = 404;
            throw err;
        }
        if (post.creator._id.toString() !== req.userId) {
            const err = new Error("Not authorized!");
            err.statusCode = 403;
            throw err;
        }
        if (imageUrl !== post.imageUrl) {
            clearImage(post.imageUrl);
        }
        post.title = title;
        post.imageUrl = imageUrl;
        post.content = content;
        const result = (yield post.save());
        socket_1.default.getIO().emit("posts", { action: "update", post: result });
        return res.status(200).json({ message: "Post updated!", post: result });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
});
FeedController.deletePost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId } = req.params;
    try {
        const post = (yield post_model_1.Post.findById(postId));
        if (!post) {
            const err = new Error("Could not find post.");
            err.statusCode = 404;
            throw err;
        }
        if (post.creator.toString() !== req.userId) {
            const err = new Error("Not authorized!");
            err.statusCode = 403;
            throw err;
        }
        // check logged in user
        clearImage(post.imageUrl);
        const result = (yield post_model_1.Post.findByIdAndRemove(postId));
        const user = (yield user_model_1.User.findById(req.userId));
        user.posts.pull(postId);
        yield user.save();
        // informs other users
        socket_1.default.getIO().emit("posts", { action: "delete", post: postId });
        res.status(200).json({ message: "Deleted post." });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
});
const clearImage = (key) => {
    s3Client_1.s3Client.deleteObject({
        Bucket: "tieubao-bucket",
        Key: key,
    }, (err, data) => { });
};
