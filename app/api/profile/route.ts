import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Profile } from "@/models/Profile";
import { getUserId } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();
  await connectDB();

  const profile = await Profile.findOneAndUpdate({ userId }, { ...data, userId }, {
    upsert: true,
    new: true,
  });

  return NextResponse.json(profile);
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const profile = await Profile.findOne({ userId });
  return NextResponse.json(profile || {});
}
