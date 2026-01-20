import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import mongoose from "mongoose";

export async function GET() {
  return NextResponse.json({ serverUp: true }, { status: 200 });
}
