import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IPathModule {
  path_id: Types.ObjectId;
  module_id: Types.ObjectId;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPathModuleDocument extends IPathModule, Document {
  _id: Types.ObjectId;
}

export type IPathModuleModel = Model<IPathModuleDocument>;

const PathModuleSchema = new Schema<IPathModuleDocument, IPathModuleModel>(
  {
    path_id: {
      type: Schema.Types.ObjectId,
      ref: "Path",
      required: [true, "Path ID is required"],
    },
    module_id: {
      type: Schema.Types.ObjectId,
      ref: "Module",
      required: [true, "Module ID is required"],
    },
    order: {
      type: Number,
      required: [true, "Order is required"],
    },
  },
  {
    timestamps: true,
  },
);

PathModuleSchema.index({ path_id: 1 });
PathModuleSchema.index({ path_id: 1, order: 1 }, { unique: true });

const PathModule: IPathModuleModel =
  (mongoose.models.PathModule as IPathModuleModel) ||
  mongoose.model<IPathModuleDocument, IPathModuleModel>(
    "PathModule",
    PathModuleSchema,
  );

export default PathModule;
