import io from "../socket";
import { NextFunction } from "express";
import { validationResult } from "express-validator";

import { CustomRequest, CustomResponse } from "../interfaces/express";
import { User, IUser } from "../models/user.model";
import { Post, IPost } from "../models/post.model";
import { s3Client } from "../s3Client";

export default class FeedController {
  static getPosts = async (
    req: CustomRequest,
    res: CustomResponse,
    next: NextFunction,
  ) => {
    const currentPage = req.query.page || 1;
    const perPage = 2;
    try {
      const totalItems: number = await Post.find().countDocuments();
      const posts: IPost[] = await Post.find()
        .populate({ path: "creator", model: User })
        .sort({ createdAt: -1 })
        .skip((+currentPage - 1) * perPage)
        .limit(perPage);

      res.status(200).json({
        message: "Fetched posts successfully.",
        posts,
        totalItems,
      });
    } catch (err: any) {
      if (!err.statusCode) {
        err.statusCode = 500; // server-side error
      }
      next(err);
    }
    // ...
  };

  static createPost = async (
    req: CustomRequest,
    res: CustomResponse,
    next: NextFunction,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const err: any = new Error(
          "Validation failed entered data is incorrect.",
        );
        err.statusCode = 422;
        throw err;
      }
      if (!req.file) {
        const err: any = new Error("No image provided.");
        err.statusCode = 422;
        throw err;
      }
      // const imageUrl: string = req.file.path.replace(/\\/g, '/');

      const imageUrl: string = req.file.key;
      const { title } = req.body;
      const { content } = req.body;
      const post: IPost = new Post({
        title,
        content,
        imageUrl,
        creator: req.userId,
      });
      await post.save();
      const user = (await User.findById(req.userId))!;
      user.posts.push(post);
      await user.save();

      // inform all other users
      io.getIO().emit("posts", {
        action: "create",
        post: {
          ...post._doc,
          creator: { _id: req.userId, name: user.name },
        },
      });

      res.status(201).json({
        message: "Post created successfully!",
        post,
        creator: { _id: user._id, name: user.name },
      });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500; // server-side error
      }
      next(err);
    }
  };

  static getPost = async (
    req: CustomRequest,
    res: CustomResponse,
    next: NextFunction,
  ) => {
    const { postId } = req.params;
    try {
      const post: IPost = (await Post.findById({ _id: postId }).populate({
        path: "creator",
        model: User,
      })) as IPost;
      if (!post) {
        const err: any = new Error("Could not find post.");
        err.statusCode = 404;
        throw err;
      }
      res.status(200).json({ message: "Post fetched.", post });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500; // server-side error
      }
      next(err);
    }
  };

  static updatePost = async (
    req: CustomRequest,
    res: CustomResponse,
    next: NextFunction,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const err: any = new Error(
          "Validation failed entered data is incorrect.",
        );
        err.statusCode = 422;
        throw err;
      }
      const { postId } = req.params;
      const { title } = req.body;
      const { content } = req.body;
      let imageUrl: any = req.body.image;
      if (req.file) {
        // imageUrl = req.file.path.replace(/\\/g, '/');
        imageUrl = req.file.key;
      }
      if (!imageUrl) {
        const err: any = new Error("No file picked.");
        err.statusCode = 402;
        throw err;
      }
      const post = (await Post.findById(postId).populate({
        path: "creator",
        model: User,
      })) as IPost;
      if (!post) {
        const err: any = new Error("Could not find post.");
        err.statusCode = 404;
        throw err;
      }
      if (post.creator._id.toString() !== req.userId) {
        const err: any = new Error("Not authorized!");
        err.statusCode = 403;
        throw err;
      }
      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }
      post.title = title;
      post.imageUrl = imageUrl;
      post.content = content;
      const result = (await post.save()) as IPost;

      io.getIO().emit("posts", { action: "update", post: result });

      return res.status(200).json({ message: "Post updated!", post: result });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  };

  static deletePost = async (
    req: CustomRequest,
    res: CustomResponse,
    next: NextFunction,
  ) => {
    const { postId } = req.params;
    try {
      const post = (await Post.findById(postId)) as IPost;
      if (!post) {
        const err: any = new Error("Could not find post.");
        err.statusCode = 404;
        throw err;
      }
      if (post.creator.toString() !== req.userId) {
        const err: any = new Error("Not authorized!");
        err.statusCode = 403;
        throw err;
      }
      // check logged in user
      clearImage(post.imageUrl);
      const result = (await Post.findByIdAndRemove(postId)) as IPost;
      const user = (await User.findById(req.userId)) as IUser;
      user.posts.pull(postId);
      await user.save();

      // informs other users
      io.getIO().emit("posts", { action: "delete", post: postId });

      res.status(200).json({ message: "Deleted post." });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  };
}

const clearImage = (key: string) => {
  (s3Client as any).deleteObject(
    {
      Bucket: "tieubao-bucket",
      Key: key,
    },
    (err: any, data: any) => {},
  );
};
