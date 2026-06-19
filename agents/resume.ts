import { openai } from "@/lib/openai";
import { Job, Profile } from "@/lib/types";

export interface TailoredResume {
  summary: string;
  highlightedSkills: string[];
  tailoredBullets: string[];
  coverLetter: string;
}

export async function resumeAgent(profile: Profile, job: Job): Promise<TailoredResume> {
  try {
    const response = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: `I am ${profile.name}. My skills: ${profile.skills?.join(", ")}. Experience: ${profile.experience}. Resume: ${profile.resumeText?.slice(0, 300) || "N/A"}

I am applying for: ${job.title} at ${job.company} (${job.location}).
Job description: ${job.description?.replace(/<[^>]*>/g, "").slice(0, 400)}

Write me:
1. A 2-3 sentence professional summary for this job
2. List my top 5 most relevant skills for this role
3. Write 4 resume bullet points tailored to this job
4. Write a short 3-paragraph cover letter

Format your response exactly like:
SUMMARY: <summary text>
SKILLS: <skill1>, <skill2>, <skill3>, <skill4>, <skill5>
BULLETS:
- <bullet1>
- <bullet2>
- <bullet3>
- <bullet4>
COVER LETTER:
<cover letter text>`,
        },
      ],
    });

    const content = response.choices[0].message.content || "";

    // Parse the text response
    const summary = content.match(/SUMMARY:\s*([\s\S]*?)(?=SKILLS:|$)/i)?.[1]?.trim() || "";
    const skillsRaw = content.match(/SKILLS:\s*([\s\S]*?)(?=BULLETS:|$)/i)?.[1]?.trim() || "";
    const bulletsRaw = content.match(/BULLETS:\s*([\s\S]*?)(?=COVER LETTER:|$)/i)?.[1]?.trim() || "";
    const coverLetter = content.match(/COVER LETTER:\s*([\s\S]*?)$/i)?.[1]?.trim() || "";

    const highlightedSkills = skillsRaw.split(",").map(s => s.trim()).filter(Boolean);
    const tailoredBullets = bulletsRaw.split("\n").map(b => b.replace(/^[-•*]\s*/, "").trim()).filter(Boolean);

    // If parsing failed, return the whole response as summary
    if (!summary && !coverLetter) {
      return {
        summary: content.slice(0, 200),
        highlightedSkills: profile.skills?.slice(0, 5) || [],
        tailoredBullets: [content.slice(200, 600)],
        coverLetter: content.slice(600) || "Could not generate cover letter.",
      };
    }

    return { summary, highlightedSkills, tailoredBullets, coverLetter };
  } catch (error) {
    console.error("Resume agent error:", error);
    return { summary: "Failed to generate. Try again.", highlightedSkills: [], tailoredBullets: [], coverLetter: "" };
  }
}
