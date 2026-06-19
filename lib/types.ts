export interface SearchCriteria {
  title: string;
  experience: string;
  location?: string;
  description?: string;
  remote?: boolean;
}

export interface Job {
  title: string;
  company: string;
  description: string;
  location: string;
  salary?: string;
  url: string;
  source: "remoteok" | "jsearch" | "adzuna" | "arbeitnow";
  postedAt?: string;
  tags?: string[];
}

export interface ScoredJob extends Job {
  score: number;
  reasons: string[];
}

export interface Profile {
  name: string;
  skills: string[];
  experience: string;
  preferredRoles: string[];
  preferredLocations: string[];
  resumeText: string;
}
