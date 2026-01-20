import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import mongoose from "mongoose";
import {
  PathModule,
  UserPathAssignment,
  UserModuleCompletion,
} from "@/lib/models";
import { createLogger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  const log = createLogger("POST /api/progress");

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    log.time("auth");

    if (!session?.user) {
      log.end(401);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { path_id, module_id } = body;
    log.time("parseBody");

    if (!path_id || !module_id) {
      log.end(400);
      return NextResponse.json(
        { error: "path_id and module_id are required" },
        { status: 400 },
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(path_id) ||
      !mongoose.Types.ObjectId.isValid(module_id)
    ) {
      log.end(400);
      return NextResponse.json(
        { error: "Invalid path_id or module_id" },
        { status: 400 },
      );
    }

    await dbConnect();
    log.time("dbConnect");

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const pathId = new mongoose.Types.ObjectId(path_id);
    const moduleId = new mongoose.Types.ObjectId(module_id);

    const assignment = await UserPathAssignment.findOne({
      user_id: userId,
      path_id: pathId,
    });
    log.time("findAssignment");

    if (!assignment) {
      log.end(404);
      return NextResponse.json(
        { error: "Path not assigned to user" },
        { status: 404 },
      );
    }

    const pathModule = await PathModule.findOne({
      path_id: pathId,
      module_id: moduleId,
    });
    log.time("findPathModule");

    if (!pathModule) {
      log.end(404);
      return NextResponse.json(
        { error: "Module not found in this path" },
        { status: 404 },
      );
    }

    const existingCompletion = await UserModuleCompletion.findOne({
      user_id: userId,
      path_id: pathId,
      module_id: moduleId,
    });
    log.time("checkExisting");

    if (existingCompletion) {
      log.end(200, { alreadyCompleted: true });
      return NextResponse.json(
        { message: "Module already completed", completion: existingCompletion },
        { status: 200 },
      );
    }

    if (pathModule.order > 1) {
      const previousModule = await PathModule.findOne({
        path_id: pathId,
        order: pathModule.order - 1,
      });

      if (previousModule) {
        const previousCompletion = await UserModuleCompletion.findOne({
          user_id: userId,
          path_id: pathId,
          module_id: previousModule.module_id,
        });

        if (!previousCompletion) {
          log.end(403, { reason: "prerequisite_not_met" });
          return NextResponse.json(
            { error: "You must complete the previous module first" },
            { status: 403 },
          );
        }
      }
    }
    log.time("checkPrerequisite");

    const completion = await UserModuleCompletion.create({
      user_id: userId,
      path_id: pathId,
      module_id: moduleId,
      completed_at: new Date(),
    });
    log.time("createCompletion");

    assignment.last_active = new Date();
    const totalModules = await PathModule.countDocuments({ path_id: pathId });
    const completedModules = await UserModuleCompletion.countDocuments({
      user_id: userId,
      path_id: pathId,
    });

    if (completedModules === totalModules) {
      assignment.completed_at = new Date();
    }

    await assignment.save();
    log.time("updateAssignment");

    log.end(200, {
      moduleOrder: pathModule.order,
      completedModules,
      totalModules,
    });

    return NextResponse.json({
      message: "Module completed successfully",
      completion,
      progress: {
        total_modules: totalModules,
        completed_modules: completedModules,
        percentage: (completedModules / totalModules) * 100,
        path_completed: completedModules === totalModules,
      },
    });
  } catch (error) {
    log.error(error);
    return NextResponse.json(
      { error: "Failed to record progress" },
      { status: 500 },
    );
  }
}
