import { Job, SearchCriteria } from "@/lib/types";

export async function fetchRemoteOK(criteria: SearchCriteria): Promise<Job[]> {
  const res = await fetch("https://remoteok.com/api", {
    headers: { "User-Agent": "job-search-agents/1.0" },
  });

  if (!res.ok) return [];

  const data = await res.json();

  // First item is metadata, skip it
  const listings = data.slice(1);

  const searchTerm = criteria.title.toLowerCase();
  const seniorKeywords = ["senior", "sr.", "lead", "staff", "principal", "manager", "director", "head"];
  const isFresher = criteria.experience.toLowerCase().includes("fresher") ||
    criteria.experience.toLowerCase().includes("entry") ||
    criteria.experience.toLowerCase().includes("junior") ||
    criteria.experience.toLowerCase().includes("0");

  return listings
    .filter((item: any) => {
      const title = item.position?.toLowerCase() || "";
      const tags = (item.tags || []).join(" ").toLowerCase();
      const desc = item.description?.toLowerCase() || "";
      const matchesSearch = title.includes(searchTerm) || tags.includes(searchTerm) || desc.includes(searchTerm);
      if (!matchesSearch) return false;
      if (isFresher && seniorKeywords.some((k) => title.includes(k))) return false;
      return true;
    })
    .map((item: any): Job => ({
      title: item.position || "",
      company: item.company || "",
      description: item.description || "",
      location: item.location || "Remote",
      salary: item.salary_min && item.salary_max
        ? `$${item.salary_min} - $${item.salary_max}`
        : undefined,
      url: item.url || `https://remoteok.com/l/${item.id}`,
      source: "remoteok",
      postedAt: item.date || undefined,
      tags: item.tags || [],
    }));
}
