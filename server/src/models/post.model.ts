import { Schema, model, Model, Document, PopulatedDoc } from "mongoose";

export interface IPost extends Document {
  title: string;
  content: string;
  imageUrl: string;
  creator: PopulatedDoc<Schema.Types.ObjectId & Document>;
  _doc?: any;
}

const postSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  { timestamps: true },
);

export const Post: Model<IPost> = model<IPost>("Post", postSchema);
