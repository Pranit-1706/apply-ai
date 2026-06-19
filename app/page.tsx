"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [experience, setExperience] = useState("fresher");
  const [location, setLocation] = useState("");
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [ranking, setRanking] = useState(false);
  const [rankProgress, setRankProgress] = useState({ done: 0, total: 0 });
  const [tailoringJob, setTailoringJob] = useState<any>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [expandedJob, setExpandedJob] = useState<number | null>(null);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [tailoring, setTailoring] = useState(false);
  const [tailoredResult, setTailoredResult] = useState<any>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") {
      fetch("/api/jobs/save").then(r => r.json()).then(data => {
        const urls = new Set((data.jobs || []).map((j: any) => j.url));
        setSavedJobs(urls);
      });
    }
  }, [status, router]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, experience, location: location || undefined }),
    });
    const data = await res.json();
    setJobs(data.jobs || []);
    setLoading(false);
  };

  const handleRankJobs = async () => {
    setRanking(true);
    const profileRes = await fetch("/api/profile");
    const profile = await profileRes.json();

    if (!profile || !profile.name) {
      alert("Please fill your profile first (click your name in the header)");
      setRanking(false);
      return;
    }

    const total = jobs.length;
    setRankProgress({ done: 0, total });
    const scoredJobs = [...jobs];

    for (let i = 0; i < total; i++) {
      let scored = false;
      for (let attempt = 0; attempt < 3 && !scored; attempt++) {
        const res = await fetch("/api/match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile, jobs: [jobs[i]] }),
        });

        if (res.ok) {
          const data = await res.json();
          const ranked = data.jobs?.[0];
          if (ranked && ranked.score > 0) {
            scoredJobs[i] = { ...scoredJobs[i], score: ranked.score, reasons: ranked.reasons || [] };
            scored = true;
          }
        }
      }

      setRankProgress({ done: i + 1, total });
      setJobs([...scoredJobs].sort((a, b) => (b.score || 0) - (a.score || 0)));
    }

    setRanking(false);
  };

  const handleTailor = async (job: any) => {
    setTailoringJob(job);
    setTailoring(true);
    setTailoredResult(null);

    try {
      const profileRes = await fetch("/api/profile");
      const profile = await profileRes.json();

      if (!profile || !profile.name) {
        alert("Please fill your profile first");
        setTailoring(false);
        return;
      }

      const res = await fetch("/api/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, job }),
      });
      const data = await res.json();
      setTailoredResult(data);
    } catch (error) {
      alert("Failed to generate tailored resume. Try again.");
    }
    setTailoring(false);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            ApplyAI
          </h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-300 hover:text-white hover:border-gray-700 cursor-pointer transition"
              >
                <span className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center text-xs text-white font-medium">
                  {session.user?.name?.[0]?.toUpperCase()}
                </span>
                {session.user?.name}
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-2 w-44 bg-gray-900 border border-gray-800 rounded-xl shadow-xl z-50 overflow-hidden">
                  <button
                    onClick={() => { router.push("/profile"); setShowMenu(false); }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 cursor-pointer transition"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => { router.push("/saved"); setShowMenu(false); }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 cursor-pointer transition"
                  >
                    Saved Jobs
                  </button>
                  <hr className="border-gray-800" />
                  <button
                    onClick={() => signOut()}
                    className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-gray-800 cursor-pointer transition"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search Form */}
        <div className="bg-gray-900/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-800/50 mb-8 shadow-lg">
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm text-gray-400 font-medium">Job Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. software developer"
                  className="w-full mt-1.5 px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 font-medium">Experience</label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full mt-1.5 px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                >
                  <option value="fresher">Fresher (0-1 years)</option>
                  <option value="junior">Junior (1-3 years)</option>
                  <option value="mid">Mid (3-5 years)</option>
                  <option value="senior">Senior (5+ years)</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 font-medium">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. India, Remote"
                  className="w-full mt-1.5 px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 disabled:opacity-50 text-white rounded-xl font-medium transition cursor-pointer"
                >
                  {loading ? "Searching..." : "Search Jobs"}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Empty state */}
        {jobs.length === 0 && !loading && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">Search for jobs to get started</p>
            <p className="text-gray-600 text-sm mt-2">We search across JSearch, Adzuna, RemoteOK, and Arbeitnow</p>
          </div>
        )}

        {/* Results */}
        {jobs.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-200">Found {jobs.length} jobs</h2>
              <button
                onClick={handleRankJobs}
                disabled={ranking}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition cursor-pointer"
              >
                {ranking ? `Ranking ${rankProgress.done}/${rankProgress.total}` : "Rank Jobs with AI"}
              </button>
            </div>

            <div className="space-y-3">
              {jobs.map((job, i) => (
                <div key={i} className="bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-800/50 hover:border-indigo-500/30 transition-all duration-200 flex group">
                  <div className="flex-1 p-5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        className="font-semibold text-lg cursor-pointer hover:text-indigo-400 transition"
                        onClick={() => setExpandedJob(expandedJob === i ? null : i)}
                      >
                        {job.title}
                      </h3>
                      <span className="text-xs px-2 py-0.5 bg-gray-800 rounded-full text-gray-400 border border-gray-700">
                        {job.source}
                      </span>
                      {job.score > 0 && (
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                          job.score >= 70 ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" :
                          job.score >= 40 ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" :
                          "bg-red-500/20 text-red-300 border border-red-500/30"
                        }`}>
                          {job.score}% match
                        </span>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleTailor(job); }}
                        className="text-xs px-2.5 py-0.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-full text-purple-300 cursor-pointer transition"
                      >
                        Generate Resume for this Job
                      </button>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          const jobKey = job.url || `${job.title}-${job.company}`;
                          const isSaved = savedJobs.has(jobKey);
                          if (!isSaved) {
                            await fetch("/api/jobs/save", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify(job),
                            });
                            setSavedJobs(prev => new Set(prev).add(jobKey));
                          } else {
                            await fetch("/api/jobs/save", {
                              method: "DELETE",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ url: job.url }),
                            });
                            setSavedJobs(prev => {
                              const next = new Set(prev);
                              next.delete(jobKey);
                              return next;
                            });
                          }
                        }}
                        className="text-xs px-2.5 py-0.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-full text-gray-300 cursor-pointer transition"
                      >
                        {savedJobs.has(job.url || `${job.title}-${job.company}`) ? "❤️ Saved" : "🤍 Save"}
                      </button>
                    </div>
                    <p className="text-gray-400 mt-1">{job.company}</p>
                    <p className="text-gray-500 text-sm mt-0.5">{job.location}</p>
                    {job.salary && (
                      <p className="text-emerald-400 text-sm mt-2 font-medium">{job.salary}</p>
                    )}
                    {job.reasons?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {job.reasons.map((r: any, j: number) => (
                          <span key={j} className="text-xs px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-300">
                            {typeof r === "string" ? r : JSON.stringify(r)}
                          </span>
                        ))}
                      </div>
                    )}
                    {expandedJob === i ? (
                      <p className="text-gray-400 text-sm mt-3 whitespace-pre-line leading-relaxed cursor-pointer" onClick={() => setExpandedJob(null)}>
                        {job.description?.replace(/<[^>]*>/g, "")}
                      </p>
                    ) : (
                      <p className="text-gray-500 text-sm mt-2 line-clamp-2 cursor-pointer hover:text-gray-400 transition" onClick={() => setExpandedJob(i)}>
                        {job.description?.replace(/<[^>]*>/g, "").slice(0, 200)}...
                      </p>
                    )}
                  </div>
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center px-6 bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 rounded-r-2xl text-white font-medium transition cursor-pointer"
                  >
                    Apply
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tailored Resume Modal */}
        {(tailoring || tailoredResult) && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-2xl border border-gray-800 max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  Tailored for: {tailoringJob?.title}
                </h2>
                <button
                  onClick={() => { setTailoring(false); setTailoredResult(null); setTailoringJob(null); }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white cursor-pointer transition"
                >
                  ✕
                </button>
              </div>

              {tailoring ? (
                <div className="text-center py-16 text-gray-400">
                  <div className="w-10 h-10 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-lg">AI is tailoring your resume...</p>
                  <p className="text-sm mt-2 text-gray-500">This may take a few seconds</p>
                </div>
              ) : tailoredResult && (
                <div className="space-y-6">
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                    <h3 className="text-sm font-medium text-indigo-400 mb-2">Professional Summary</h3>
                    <p className="text-gray-300">{tailoredResult.summary}</p>
                  </div>

                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                    <h3 className="text-sm font-medium text-indigo-400 mb-3">Highlight These Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {tailoredResult.highlightedSkills?.map((skill: any, i: number) => (
                        <span key={i} className="px-3 py-1.5 bg-indigo-500/20 text-indigo-300 rounded-lg text-sm border border-indigo-500/30">
                          {typeof skill === "string" ? skill : skill?.name || JSON.stringify(skill)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                    <h3 className="text-sm font-medium text-indigo-400 mb-3">Tailored Experience Bullets</h3>
                    <ul className="space-y-2">
                      {tailoredResult.tailoredBullets?.map((bullet: any, i: number) => (
                        <li key={i} className="text-gray-300 text-sm flex gap-2">
                          <span className="text-indigo-400 mt-0.5">•</span>
                          <span>{typeof bullet === "string" ? bullet : JSON.stringify(bullet)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                    <h3 className="text-sm font-medium text-indigo-400 mb-2">Cover Letter</h3>
                    <p className="text-gray-300 whitespace-pre-line text-sm leading-relaxed">{tailoredResult.coverLetter}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
