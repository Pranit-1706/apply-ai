"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SavedJobsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    async function fetchSaved() {
      const res = await fetch("/api/jobs/save");
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
      }
      setLoading(false);
    }
    if (status === "authenticated") fetchSaved();
  }, [status]);

  const handleRemove = async (url: string) => {
    await fetch("/api/jobs/save", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    setJobs(jobs.filter(j => j.url !== url));
  };

  if (status === "loading" || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Saved Jobs</h1>
          <button onClick={() => router.push("/")} className="text-sm text-blue-400 hover:underline cursor-pointer">
            ← Back to Dashboard
          </button>
        </div>

        {jobs.length === 0 ? (
          <p className="text-gray-400 text-center py-12">No saved jobs yet. Search and save jobs you like.</p>
        ) : (
          <div className="space-y-4">
            {jobs.map((job, i) => (
              <div key={i} className="bg-gray-900 rounded-xl border border-gray-800 flex">
                <div className="flex-1 p-5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{job.title}</h3>
                    <span className="text-xs px-2 py-0.5 bg-gray-800 rounded text-gray-300">
                      {job.source}
                    </span>
                    {job.score > 0 && (
                      <span className="text-xs px-2 py-0.5 bg-green-900 text-green-300 rounded font-medium">
                        {job.score}% match
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400">{job.company}</p>
                  <p className="text-gray-500 text-sm mt-1">{job.location}</p>
                  {job.salary && (
                    <p className="text-green-400 text-sm mt-2">{job.salary}</p>
                  )}
                  <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                    {job.description?.replace(/<[^>]*>/g, "").slice(0, 200)}...
                  </p>
                </div>
                <div className="flex flex-col">
                  <button
                    onClick={() => handleRemove(job.url)}
                    className="flex-1 flex items-center justify-center px-6 bg-red-600 hover:bg-red-700 rounded-tr-xl text-white font-medium transition cursor-pointer"
                  >
                    Remove
                  </button>
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center px-6 bg-blue-600 hover:bg-blue-700 rounded-br-xl text-white font-medium transition cursor-pointer"
                  >
                    Apply
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
