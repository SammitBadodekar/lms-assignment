import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import mongoose from "mongoose";
import { UserPathAssignment, PathModule, UserModuleCompletion } from "@/lib/models";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const userId = new mongoose.Types.ObjectId(session.user.id);

    const paths = await UserPathAssignment.aggregate([
      { $match: { user_id: userId } },
      {
        $lookup: {
          from: "paths",
          localField: "path_id",
          foreignField: "_id",
          as: "path",
        },
      },
      { $unwind: "$path" },
      {
        $lookup: {
          from: "pathmodules",
          localField: "path_id",
          foreignField: "path_id",
          as: "modules",
        },
      },
      {
        $lookup: {
          from: "usermodulecompletions",
          let: { pathId: "$path_id", userId: "$user_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$path_id", "$$pathId"] },
                    { $eq: ["$user_id", "$$userId"] },
                  ],
                },
              },
            },
          ],
          as: "completions",
        },
      },
      {
        $project: {
          _id: "$path._id",
          title: "$path.title",
          description: "$path.description",
          image: "$path.image",
          last_active: 1,
          completed_at: 1,
          total_modules: { $size: "$modules" },
          completed_modules: { $size: "$completions" },
          progress: {
            $cond: {
              if: { $eq: [{ $size: "$modules" }, 0] },
              then: 0,
              else: {
                $multiply: [
                  { $divide: [{ $size: "$completions" }, { $size: "$modules" }] },
                  100,
                ],
              },
            },
          },
        },
      },
    ]);

    return NextResponse.json({ paths });
  } catch (error) {
    console.error("Error fetching paths:", error);
    return NextResponse.json(
      { error: "Failed to fetch paths" },
      { status: 500 }
    );
  }
}
