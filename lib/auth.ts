import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import mongoose from "mongoose";
import { Path, UserPathAssignment } from "./models";

const client = new MongoClient(process.env.DATABASE_URL!);
const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes - session data cached in cookie
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            if (mongoose.connection.readyState !== 1) {
              await mongoose.connect(process.env.DATABASE_URL!);
            }
            const paths = await Path.find({});

            for (const path of paths) {
              await UserPathAssignment.create({
                user_id: new mongoose.Types.ObjectId(user.id),
                path_id: path._id,
                last_active: new Date(),
                completed_at: null,
              });
            }
            console.log(
              `Assigned ${paths.length} paths to new user: ${user.email}`,
            );
          } catch (error) {
            console.error("Error assigning paths to user:", error);
          }
        },
      },
    },
  },
});
