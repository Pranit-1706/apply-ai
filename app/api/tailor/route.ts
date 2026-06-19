import { NextRequest, NextResponse } from "next/server";
import { resumeAgent } from "@/agents/resume";
import { Job, Profile } from "@/lib/types";

export async function POST(req: NextRequest) {
  const { profile, job }: { profile: Profile; job: Job } = await req.json();

  if (!profile || !job) {
    return NextResponse.json(
      { error: "profile and job are required" },
      { status: 400 }
    );
  }

  const tailored = await resumeAgent(profile, job);
  return NextResponse.json(tailored);
}
