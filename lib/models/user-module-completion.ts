import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IUserModuleCompletion {
  user_id: Types.ObjectId;
  path_id: Types.ObjectId;
  module_id: Types.ObjectId;
  completed_at: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserModuleCompletionDocument
  extends IUserModuleCompletion, Document {
  _id: Types.ObjectId;
}

export type IUserModuleCompletionModel = Model<IUserModuleCompletionDocument>;

const UserModuleCompletionSchema = new Schema<
  IUserModuleCompletionDocument,
  IUserModuleCompletionModel
>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: [true, "User ID is required"],
    },
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
    completed_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

UserModuleCompletionSchema.index({ user_id: 1, path_id: 1 });
UserModuleCompletionSchema.index(
  { user_id: 1, path_id: 1, module_id: 1 },
  { unique: true },
);

const UserModuleCompletion: IUserModuleCompletionModel =
  (mongoose.models.UserModuleCompletion as IUserModuleCompletionModel) ||
  mongoose.model<IUserModuleCompletionDocument, IUserModuleCompletionModel>(
    "UserModuleCompletion",
    UserModuleCompletionSchema,
  );

export default UserModuleCompletion;
