import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IModule {
  title: string;
  description: string;
  image: string;
  content_type: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IModuleDocument extends IModule, Document {
  _id: Types.ObjectId;
}

export type IModuleModel = Model<IModuleDocument>;

const ModuleSchema = new Schema<IModuleDocument, IModuleModel>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [false, "Description is required"],
    },
    image: {
      type: String,
      required: [false, "Image is required"],
    },
    content_type: {
      type: String,
      required: [true, "Content type is required"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
  },
  {
    timestamps: true,
  },
);

const Module: IModuleModel =
  (mongoose.models.Module as IModuleModel) ||
  mongoose.model<IModuleDocument, IModuleModel>("Module", ModuleSchema);

export default Module;
