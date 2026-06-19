"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [preferredRoles, setPreferredRoles] = useState("");
  const [preferredLocations, setPreferredLocations] = useState("");
  const [resumeText, setResumeText] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    async function fetchProfile() {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        if (data && data.name) {
          setName(data.name);
          setSkills((data.skills || []).join(", "));
          setExperience(data.experience || "");
          setPreferredRoles((data.preferredRoles || []).join(", "));
          setPreferredLocations((data.preferredLocations || []).join(", "));
          setResumeText(data.resumeText || "");
        }
      }
      setLoading(false);
    }
    if (status === "authenticated") fetchProfile();
  }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        experience,
        preferredRoles: preferredRoles.split(",").map((s) => s.trim()).filter(Boolean),
        preferredLocations: preferredLocations.split(",").map((s) => s.trim()).filter(Boolean),
        resumeText,
      }),
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => router.push("/"), 500);
  };

  if (status === "loading" || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Your Profile</h1>
          <button onClick={() => router.push("/")} className="text-sm text-blue-400 hover:underline cursor-pointer">
            ← Back to Dashboard
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm text-gray-400">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-400">Skills (comma separated)</label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="React, Node.js, TypeScript, MongoDB"
              className="w-full mt-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400">Experience Level</label>
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full mt-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Select...</option>
              <option value="fresher">Fresher (0-1 years)</option>
              <option value="junior">Junior (1-3 years)</option>
              <option value="mid">Mid (3-5 years)</option>
              <option value="senior">Senior (5+ years)</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-400">Preferred Roles (comma separated)</label>
            <input
              type="text"
              value={preferredRoles}
              onChange={(e) => setPreferredRoles(e.target.value)}
              placeholder="Frontend Developer, Full Stack Developer"
              className="w-full mt-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400">Preferred Locations (comma separated)</label>
            <input
              type="text"
              value={preferredLocations}
              onChange={(e) => setPreferredLocations(e.target.value)}
              placeholder="Bangalore, Remote, India"
              className="w-full mt-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400">Resume / About (paste your resume text)</label>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              rows={8}
              placeholder="Paste your resume content here... This will be used by the AI to tailor your applications."
              className="w-full mt-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-y"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg font-medium transition cursor-pointer"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>

          {saved && (
            <p className="text-green-400 text-sm text-center">Profile saved successfully!</p>
          )}
        </form>
      </div>
    </div>
  );
}
