import { openai } from "@/lib/openai";
import { Job, ScoredJob, Profile } from "@/lib/types";

export async function matcherAgent(profile: Profile, jobs: Job[]): Promise<ScoredJob[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `Score this job 0-100 for the candidate. Rules:
- If job requires more experience than candidate has, score low
- Only count skills the candidate actually listed
- If skills and experience match well, score 80-95
- Location mismatch = reduce 10 points

Respond with ONLY a number on the first line and one short reason on the second line. Nothing else. Example:
72
Requires 3 years experience but candidate is fresher`,
        },
        {
          role: "user",
          content: `Candidate: ${profile.skills?.join(", ")} | Experience: ${profile.experience} | Wants: ${profile.preferredRoles?.join(", ")} in ${profile.preferredLocations?.join(", ")}

Job: ${jobs[0].title} at ${jobs[0].company}, ${jobs[0].location}
${jobs[0].description?.replace(/<[^>]*>/g, "").slice(0, 400)}`,
        },
      ],
    });

    const content = response.choices[0].message.content?.trim() || "";
    const lines = content.split("\n").filter(Boolean);
    const score = parseInt(lines[0]) || 0;
    const reason = lines.slice(1).join(" ").trim() || "No reason provided";

    return jobs.map((job) => ({
      ...job,
      score: Math.min(100, Math.max(0, score)),
      reasons: [reason],
    }));
  } catch (error) {
    console.error("Matcher agent error:", error);
    return jobs.map((j) => ({ ...j, score: 0, reasons: [] }));
  }
}
