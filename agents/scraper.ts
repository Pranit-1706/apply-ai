import { Job, SearchCriteria } from "@/lib/types";
import { fetchRemoteOK } from "@/services/remoteok";
import { fetchArbeitnow } from "@/services/arbeitnow";
import { fetchJSearch } from "@/services/jsearch";
import { fetchAdzuna } from "@/services/adzuna";

export async function scraperAgent(criteria: SearchCriteria): Promise<Job[]> {
  const results = await Promise.allSettled([
    fetchRemoteOK(criteria),
    fetchArbeitnow(criteria),
    fetchJSearch(criteria),
    fetchAdzuna(criteria),
  ]);

  const jobs: Job[] = [];

  for (const result of results) {
    if (result.status === "fulfilled") {
      jobs.push(...result.value);
    }
  }

  return deduplicate(jobs);
}

function deduplicate(jobs: Job[]): Job[] {
  const seen = new Set<string>();
  return jobs.filter((job) => {
    const key = `${job.title.toLowerCase()}-${job.company.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
