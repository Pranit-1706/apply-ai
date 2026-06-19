import { Job, SearchCriteria } from "@/lib/types";

export async function fetchJSearch(criteria: SearchCriteria): Promise<Job[]> {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) return [];

  const query = `${criteria.title}${criteria.location ? ` in ${criteria.location}` : ""}`;
  const params = new URLSearchParams({
    query,
    num_pages: "1",
  });
  if (criteria.remote) params.set("remote_jobs_only", "true");

  const res = await fetch(`https://jsearch.p.rapidapi.com/search?${params}`, {
    headers: {
      "x-rapidapi-key": apiKey,
      "x-rapidapi-host": "jsearch.p.rapidapi.com",
    },
  });

  if (!res.ok) return [];

  const data = await res.json();

  const seniorKeywords = ["senior", "sr.", "sr ", "lead", "staff", "principal", "manager", "mgr", "director", "head", "architect", "vp", "chief"];
  const isFresher = criteria.experience.toLowerCase().includes("fresher") ||
    criteria.experience.toLowerCase().includes("entry") ||
    criteria.experience.toLowerCase().includes("junior") ||
    criteria.experience.toLowerCase().includes("0");

  return (data.data || [])
    .filter((item: any) => {
      if (isFresher && seniorKeywords.some((k) => (item.job_title || "").toLowerCase().includes(k))) return false;
      return true;
    })
    .map((item: any): Job => ({
    title: item.job_title || "",
    company: item.employer_name || "",
    description: item.job_description || "",
    location: item.job_city
      ? `${item.job_city}, ${item.job_country}`
      : item.job_country || "Unknown",
    salary: item.job_min_salary && item.job_max_salary
      ? `$${item.job_min_salary} - $${item.job_max_salary}`
      : undefined,
    url: item.job_apply_link || "",
    source: "jsearch",
    postedAt: item.job_posted_at_datetime_utc || undefined,
    tags: [],
  }));
}
