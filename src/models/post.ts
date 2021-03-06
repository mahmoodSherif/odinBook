import { Schema, Document, model } from "mongoose";
import { IUser, UserBaseWithId } from "./user";

export enum postType {
  text = "text",
}

const postSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(postType),
      required: true,
    },
    text: String,
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export interface PostBase {
  type: postType;
  text: string;

  user?: UserBaseWithId | IUser["_id"];
  likes?: UserBaseWithId[] | IUser["_id"][];
}

export interface PostBaseWithId extends PostBase {
  _id: IPost["_id"];
}

export interface IPost extends Document, PostBase {}

export default model<IPost>("Post", postSchema);
