"use client";

import Link from "next/link";
import {
  FiUpload,
  FiSearch,
  FiBell,
  FiUser,
  FiMenu,
  FiX,
  FiMapPin,
} from "react-icons/fi";
import { useEffect, useState } from "react";

/* ===================== TYPES ===================== */

interface Job {
  title: string;
  company: string;
  description: string;
  location: string;
  link: string;
  source: string;
  remote?: boolean;
}

/* ===================== HELPERS ===================== */

function calculateMatchScore(
  description: string,
  location: string,
  skills: string[],
  country: string
) {
  let score = 0;
  const desc = description.toLowerCase();
  const loc = location.toLowerCase();

  skills.forEach((skill) => {
    if (desc.includes(skill.toLowerCase())) score += 10;
  });
  score = Math.min(score, 60);

  if (loc.includes("remote")) score += 20;
  else if (country && loc.includes(country.toLowerCase())) score += 20;

  if (desc.includes("developer") || desc.includes("engineer")) score += 10;
  if (desc.includes("experience")) score += 10;

  return Math.min(score, 100);
}

/* ===================== PAGE ===================== */

export default function FindJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [country, setCountry] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<"all" | "local" | "remote">("all");

  /* ===================== INIT ===================== */

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("skills");
    if (stored) {
      try {
        setSkills(JSON.parse(stored));
      } catch {}
    }
  }, []);

  /* ===================== SKILLS ===================== */

  const addSkill = () => {
    const s = skillInput.trim();
    if (!s || skills.includes(s)) return setSkillInput("");
    const next = [...skills, s];
    setSkills(next);
    localStorage.setItem("skills", JSON.stringify(next));
    setSkillInput("");
  };

  const removeSkill = (s: string) => {
    const next = skills.filter((k) => k !== s);
    setSkills(next);
    localStorage.setItem("skills", JSON.stringify(next));
  };

  /* ===================== FETCH JOBS ===================== */

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/search-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country, keywords: skills }),
      });
      const data = await res.json();
      setJobs(data.jobs || data);
    } catch {
      setJobs([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (mounted) fetchJobs();
  }, [mounted]);

  /* ===================== FILTER ===================== */

  const filteredJobs = jobs.filter((job) => {
    const loc = job.location.toLowerCase();
    if (filter === "local")
      return loc.includes(country.toLowerCase()) || loc.includes("zimbabwe");
    if (filter === "remote") return job.remote || loc.includes("remote");
    return true;
  });

  /* ===================== ACTIONS ===================== */

  const autoApply = async (job: Job) => {
    try {
      await fetch("/api/applied-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...job,
          appliedAt: new Date().toISOString(),
        }),
      });
    } catch {}
    window.open(job.link, "_blank");
  };

  const saveJob = async (job: Job) => {
    await fetch("/api/save-job", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(job),
    });
    alert("Job saved!");
  };

  if (!mounted) return <div className="min-h-screen bg-slate-100" />;

  /* ===================== UI ===================== */

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-sky-100 to-emerald-200">

      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="font-black text-xl flex items-center gap-3">
            <span className="bg-green-600 text-white px-3 py-1 rounded-xl">QA</span>
            QuickApplyAI
          </div>

          <div className="hidden md:flex gap-6 font-medium">
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/upload-cv">Upload CV</Link>
            <Link href="/find-jobs" className="text-green-600">Find Jobs</Link>
            <Link href="/applied">Applied</Link>
            <Link href="/notifications">Notifications</Link>
          </div>

          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden text-2xl">
            {mobileMenu ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </nav>

      {/* HEADER */}
      <header className="text-center mt-16 px-4">
        <h1 className="text-4xl md:text-6xl font-black">Find Matching Jobs</h1>
        <p className="text-gray-700 mt-4 max-w-xl mx-auto">
          We match real opportunities using your skills and preferences.
        </p>
      </header>

      {/* FILTERS */}
      <section className="max-w-5xl mx-auto mt-10 px-4">
        <div className="bg-white/80 p-6 rounded-3xl shadow grid md:grid-cols-3 gap-4">
          <input
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Country (Zimbabwe, Remote)"
            className="p-3 rounded-xl border"
          />

          <div className="flex gap-2">
            {["all", "local", "remote"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 rounded-xl ${
                  filter === f ? "bg-green-600 text-white" : "bg-gray-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <button
            onClick={fetchJobs}
            className="bg-green-600 text-white rounded-xl font-bold"
          >
            Apply Filters
          </button>
        </div>

        {/* SKILLS */}
        <div className="bg-white/80 mt-6 p-6 rounded-3xl shadow">
          <div className="flex flex-col md:flex-row gap-3">
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSkill()}
              placeholder="Add skill (React, Python...)"
              className="flex-1 p-3 rounded-xl border"
            />
            <button onClick={addSkill} className="bg-blue-600 text-white px-6 rounded-xl">
              Add Skill
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {skills.map((s) => (
              <span
                key={s}
                className="bg-green-100 text-green-800 px-4 py-1 rounded-full font-semibold"
              >
                {s} <button onClick={() => removeSkill(s)}>✕</button>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* JOBS */}
      <main className="max-w-7xl mx-auto px-4 pb-24 mt-10">
        {loading ? (
          <p className="text-center">Loading jobs…</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job, idx) => {
              const match = calculateMatchScore(
                job.description,
                job.location,
                skills,
                country
              );

              return (
                <div key={idx} className="bg-white p-6 rounded-3xl shadow flex flex-col justify-between">
                  <div>
                    <h2 className="font-bold text-xl">{job.title}</h2>
                    <p className="text-gray-600">{job.company}</p>
                    <p className="text-sm text-gray-500">{job.location}</p>
                    <p className="mt-3 text-sm">{job.description?.slice(0, 160)}...</p>
                    <span className="inline-block mt-3 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs">
                      {match}% Match
                    </span>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <button onClick={() => autoApply(job)} className="flex-1 bg-green-600 text-white rounded-xl p-3">
                      Auto Apply 🤖
                    </button>
                    <button onClick={() => saveJob(job)} className="flex-1 bg-blue-100 rounded-xl p-3">
                      Save
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
