import { Router } from "express";
import { body } from "express-validator/check";

import FeedController from "../controllers/feed.controller";
import isAuth from "../middlewares/is-auth.mdw";

const router = Router();

// GET /feed/posts
router.get("/posts", FeedController.getPosts);

// POST /feed/post
router.post(
  "/post",
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  isAuth,
  FeedController.createPost,
);

router.get("/post/:postId", isAuth, FeedController.getPost);

router.put(
  "/post/:postId",
  isAuth,
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  FeedController.updatePost,
);

router.delete("/post/:postId", isAuth, FeedController.deletePost);

export default router;
