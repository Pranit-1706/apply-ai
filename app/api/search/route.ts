import { NextRequest, NextResponse } from "next/server";
import { scraperAgent } from "@/agents/scraper";
import { SearchCriteria } from "@/lib/types";
import { connectDB } from "@/lib/mongodb";
import { Job } from "@/models/Job";
import { getUserId } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const criteria: SearchCriteria = await req.json();

  if (!criteria.title || !criteria.experience) {
    return NextResponse.json({ error: "title and experience are required" }, { status: 400 });
  }

  const jobs = await scraperAgent(criteria);

  await connectDB();
  for (const job of jobs) {
    await Job.findOneAndUpdate(
      { userId, title: job.title, company: job.company },
      { ...job, userId, searchQuery: criteria.title },
      { upsert: true, new: true }
    );
  }

  return NextResponse.json({ jobs, count: jobs.length });
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const jobs = await Job.find({ userId }).sort({ score: -1, createdAt: -1 }).limit(100);
  return NextResponse.json({ jobs });
}
