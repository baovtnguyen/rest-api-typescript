"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const check_1 = require("express-validator/check");
const feed_controller_1 = __importDefault(require("../controllers/feed.controller"));
const is_auth_mdw_1 = __importDefault(require("../middlewares/is-auth.mdw"));
const router = express_1.Router();
// GET /feed/posts
router.get("/posts", feed_controller_1.default.getPosts);
// POST /feed/post
router.post("/post", [
    check_1.body("title").trim().isLength({ min: 5 }),
    check_1.body("content").trim().isLength({ min: 5 }),
], is_auth_mdw_1.default, feed_controller_1.default.createPost);
router.get("/post/:postId", is_auth_mdw_1.default, feed_controller_1.default.getPost);
router.put("/post/:postId", is_auth_mdw_1.default, [
    check_1.body("title").trim().isLength({ min: 5 }),
    check_1.body("content").trim().isLength({ min: 5 }),
], feed_controller_1.default.updatePost);
router.delete("/post/:postId", is_auth_mdw_1.default, feed_controller_1.default.deletePost);
exports.default = router;
