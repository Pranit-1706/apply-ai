import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { SavedJob } from "@/models/SavedJob";
import { getUserId } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const job = await req.json();
  await connectDB();

  await SavedJob.findOneAndUpdate(
    { userId, url: job.url },
    { ...job, userId },
    { upsert: true, new: true }
  );

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { url } = await req.json();
  await connectDB();
  await SavedJob.deleteOne({ userId, url });

  return NextResponse.json({ success: true });
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const jobs = await SavedJob.find({ userId }).sort({ savedAt: -1 });
  return NextResponse.json({ jobs });
}
