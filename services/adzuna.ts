import { Job, SearchCriteria } from "@/lib/types";

export async function fetchAdzuna(criteria: SearchCriteria): Promise<Job[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) return [];

  const country = criteria.location?.toLowerCase().includes("india") ? "in"
    : criteria.location?.toLowerCase().includes("uk") ? "gb"
    : criteria.location?.toLowerCase().includes("us") ? "us"
    : "us";

  const params = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    what: criteria.title,
    results_per_page: "50",
  });
  if (criteria.location) params.set("where", criteria.location);

  const res = await fetch(
    `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params}`
  );

  if (!res.ok) return [];

  const data = await res.json();

  const seniorKeywords = ["senior", "sr.", "sr ", "lead", "staff", "principal", "manager", "mgr", "director", "head", "architect", "vp", "chief"];
  const isFresher = criteria.experience.toLowerCase().includes("fresher") ||
    criteria.experience.toLowerCase().includes("entry") ||
    criteria.experience.toLowerCase().includes("junior") ||
    criteria.experience.toLowerCase().includes("0");

  return (data.results || [])
    .filter((item: any) => {
      const title = (item.title || "").toLowerCase();
      if (isFresher && seniorKeywords.some((k) => title.includes(k))) return false;
      // Filter out jobs requiring 5+ years for freshers
      const desc = (item.description || "").toLowerCase();
      if (isFresher && /(\d+)\+?\s*years/.test(desc)) {
        const years = parseInt(desc.match(/(\d+)\+?\s*years/)?.[1] || "0");
        if (years >= 5) return false;
      }
      return true;
    })
    .map((item: any): Job => ({
    title: item.title || "",
    company: item.company?.display_name || "",
    description: item.description || "",
    location: item.location?.display_name || "Unknown",
    salary: item.salary_min && item.salary_max
      ? `${item.salary_min} - ${item.salary_max}`
      : undefined,
    url: item.redirect_url || "",
    source: "adzuna",
    postedAt: item.created || undefined,
    tags: item.category?.tag ? [item.category.tag] : [],
  }));
}
