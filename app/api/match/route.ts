import { NextRequest, NextResponse } from "next/server";
import { matcherAgent } from "@/agents/matcher";
import { Job, Profile } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { profile, jobs }: { profile: Profile; jobs: Job[] } = await req.json();

    if (!profile || !jobs?.length) {
      return NextResponse.json({ error: "profile and jobs are required" }, { status: 400 });
    }

    const scoredJobs = await matcherAgent(profile, jobs);
    return NextResponse.json({ jobs: scoredJobs });
  } catch (error) {
    console.error("Match API error:", error);
    return NextResponse.json({ error: "Failed to rank jobs" }, { status: 500 });
  }
}
