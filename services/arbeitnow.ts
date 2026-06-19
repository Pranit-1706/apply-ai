import { Job, SearchCriteria } from "@/lib/types";

export async function fetchArbeitnow(criteria: SearchCriteria): Promise<Job[]> {
  const params = new URLSearchParams();
  params.set("search", criteria.title);
  if (criteria.location) params.set("location", criteria.location);
  if (criteria.remote) params.set("remote", "true");

  const res = await fetch(`https://www.arbeitnow.com/api/job-board-api?${params}`);
  if (!res.ok) return [];

  const data = await res.json();

  const searchTerm = criteria.title.toLowerCase();
  const seniorKeywords = ["senior", "sr.", "lead", "staff", "principal", "manager", "director", "head"];
  const isFresher = criteria.experience.toLowerCase().includes("fresher") ||
    criteria.experience.toLowerCase().includes("entry") ||
    criteria.experience.toLowerCase().includes("junior") ||
    criteria.experience.toLowerCase().includes("0");

  return (data.data || [])
    .filter((item: any) => {
      const title = item.title?.toLowerCase() || "";
      const desc = item.description?.toLowerCase() || "";
      const tags = (item.tags || []).join(" ").toLowerCase();
      const matchesSearch = title.includes(searchTerm) || tags.includes(searchTerm) || desc.includes(searchTerm);
      if (!matchesSearch) return false;
      if (isFresher && seniorKeywords.some((k) => title.includes(k))) return false;
      return true;
    })
    .map((item: any): Job => ({
      title: item.title || "",
      company: item.company_name || "",
      description: item.description || "",
      location: item.location || (item.remote ? "Remote" : "Unknown"),
      url: item.url || "",
      source: "arbeitnow",
      postedAt: item.created_at ? new Date(item.created_at * 1000).toISOString() : undefined,
      tags: item.tags || [],
    }));
}
