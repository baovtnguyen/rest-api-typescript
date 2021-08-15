import { Schema, model, Model, Document, PopulatedDoc } from "mongoose";

import { IPost } from "./post.model";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  status: string;
  posts: any | Array<Schema.Types.ObjectId & IPost & Document>;
  _doc: any;
}

const userSchema = new Schema<IUser>({
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
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Post",
    },
  ],
});

export const User: Model<IUser> = model<IUser>("User", userSchema);
