import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IUserPathAssignment {
  user_id: Types.ObjectId;
  path_id: Types.ObjectId;
  last_active: Date;
  completed_at: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserPathAssignmentDocument
  extends IUserPathAssignment, Document {
  _id: Types.ObjectId;
}

export type IUserPathAssignmentModel = Model<IUserPathAssignmentDocument>;

const UserPathAssignmentSchema = new Schema<
  IUserPathAssignmentDocument,
  IUserPathAssignmentModel
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
    last_active: {
      type: Date,
      default: Date.now,
    },
    completed_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

UserPathAssignmentSchema.index({ user_id: 1 });
UserPathAssignmentSchema.index({ user_id: 1, path_id: 1 }, { unique: true });

const UserPathAssignment: IUserPathAssignmentModel =
  (mongoose.models.UserPathAssignment as IUserPathAssignmentModel) ||
  mongoose.model<IUserPathAssignmentDocument, IUserPathAssignmentModel>(
    "UserPathAssignment",
    UserPathAssignmentSchema,
  );

export default UserPathAssignment;
