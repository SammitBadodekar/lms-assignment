import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IPath {
  title: string;
  description: string;
  image: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPathDocument extends IPath, Document {
  _id: Types.ObjectId;
}

export type IPathModel = Model<IPathDocument>;

const PathSchema = new Schema<IPathDocument, IPathModel>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    image: {
      type: String,
      required: [true, "Image is required"],
    },
  },
  {
    timestamps: true,
  }
);

const Path: IPathModel =
  (mongoose.models.Path as IPathModel) ||
  mongoose.model<IPathDocument, IPathModel>("Path", PathSchema);

export default Path;
