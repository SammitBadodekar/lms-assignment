import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import mongoose from "mongoose";
import {
  Path,
  PathModule,
  UserPathAssignment,
  UserModuleCompletion,
} from "@/lib/models";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid path ID" }, { status: 400 });
    }

    await dbConnect();

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const pathId = new mongoose.Types.ObjectId(id);

    const assignment = await UserPathAssignment.findOne({
      user_id: userId,
      path_id: pathId,
    });
    if (!assignment) {
      return NextResponse.json(
        { error: "Path not found or not assigned to user" },
        { status: 404 },
      );
    }

    const path = await Path.findById(pathId);
    if (!path) {
      return NextResponse.json({ error: "Path not found" }, { status: 404 });
    }

    const modules = await PathModule.aggregate([
      { $match: { path_id: pathId } },
      { $sort: { order: 1 } },
      {
        $lookup: {
          from: "modules",
          localField: "module_id",
          foreignField: "_id",
          as: "module",
        },
      },
      { $unwind: "$module" },
      {
        $lookup: {
          from: "usermodulecompletions",
          let: { moduleId: "$module_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$module_id", "$$moduleId"] },
                    { $eq: ["$user_id", userId] },
                    { $eq: ["$path_id", pathId] },
                  ],
                },
              },
            },
          ],
          as: "completion",
        },
      },
      {
        $project: {
          _id: "$module._id",
          title: "$module.title",
          description: "$module.description",
          image: "$module.image",
          content_type: "$module.content_type",
          content: "$module.content",
          order: 1,
          is_completed: { $gt: [{ $size: "$completion" }, 0] },
          completed_at: { $arrayElemAt: ["$completion.completed_at", 0] },
        },
      },
    ]);

    const completedCount = await UserModuleCompletion.countDocuments({
      user_id: userId,
      path_id: pathId,
    });
    const totalModules = modules.length;
    const progress =
      totalModules > 0 ? (completedCount / totalModules) * 100 : 0;

    return NextResponse.json({
      path: {
        _id: path._id,
        title: path.title,
        description: path.description,
        image: path.image,
        last_active: assignment.last_active,
        completed_at: assignment.completed_at,
        total_modules: totalModules,
        completed_modules: completedCount,
        progress,
        modules,
      },
    });
  } catch (error) {
    console.error("Error fetching path:", error);
    return NextResponse.json(
      { error: "Failed to fetch path" },
      { status: 500 },
    );
  }
}
