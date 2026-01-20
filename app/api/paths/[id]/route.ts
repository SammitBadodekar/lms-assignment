import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import mongoose from "mongoose";
import {
  Path,
  PathModule,
  UserPathAssignment,
} from "@/lib/models";
import { createLogger } from "@/lib/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const log = createLogger(`GET /api/paths/${id}`);

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    log.time("auth");

    if (!session?.user) {
      log.end(401);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      log.end(400);
      return NextResponse.json({ error: "Invalid path ID" }, { status: 400 });
    }

    await dbConnect();
    log.time("dbConnect");

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const pathId = new mongoose.Types.ObjectId(id);

    // Run independent queries in parallel
    const [assignment, path, modules] = await Promise.all([
      UserPathAssignment.findOne({
        user_id: userId,
        path_id: pathId,
      }),
      Path.findById(pathId),
      PathModule.aggregate([
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
      ]),
    ]);
    log.time("parallelQueries");

    if (!assignment) {
      log.end(404);
      return NextResponse.json(
        { error: "Path not found or not assigned to user" },
        { status: 404 },
      );
    }

    if (!path) {
      log.end(404);
      return NextResponse.json({ error: "Path not found" }, { status: 404 });
    }

    // Calculate completed count from aggregation result (no extra query needed)
    const totalModules = modules.length;
    const completedCount = modules.filter((m) => m.is_completed).length;
    const progress =
      totalModules > 0 ? (completedCount / totalModules) * 100 : 0;

    log.end(200, { moduleCount: totalModules, completedCount });
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
    log.error(error);
    return NextResponse.json(
      { error: "Failed to fetch path" },
      { status: 500 },
    );
  }
}
