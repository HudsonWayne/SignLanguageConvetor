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

interface Job {
  title: string;
  company: string;
  description: string;
  location: string;
  link: string;
  source: string;
}

export default function FindJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [country, setCountry] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Mock user/applicant data for auto-apply
  const user = {
    fullName: "Wayne Benhura",
    email: "wayne@email.com",
    phone: "+263771000000",
    resumeUrl: "/resume.pdf",
  };

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("skills");
    if (stored) {
      try {
        setSkills(JSON.parse(stored));
      } catch {}
    }
  }, []);

  const addSkill = () => {
    const s = skillInput.trim();
    if (!s || skills.includes(s)) {
      setSkillInput("");
      return;
    }
    const next = [...skills, s];
    setSkills(next);
    localStorage.setItem("skills", JSON.stringify(next));
    setSkillInput("");
  };

  const removeSkill = (s: string) => {
    const next = skills.filter(k => k !== s);
    setSkills(next);
    localStorage.setItem("skills", JSON.stringify(next));
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/search-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country, keywords: skills }),
      });
      const data = await res.json();
      setJobs(data.jobs || data); // support both structures
    } catch (e) {
      console.error("fetchJobs error", e);
      setJobs([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (mounted) fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  // Auto apply function
  const autoApply = async (job: Job) => {
    try {
      const res = await fetch("/api/auto-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job, user }),
      });

      const data = await res.json();

      if (data.redirect) {
        window.open(data.redirect, "_blank");
      } else {
        alert(data.message || "Application sent successfully!");
      }
    } catch (e) {
      console.error("Auto apply failed", e);
      alert("Auto apply failed. Please try manually.");
    }
  };

  // Manual apply fallback
  const applyToJob = async (job: Job) => {
    window.open(job.link, "_blank");
  };

  if (!mounted) return <div className="min-h-screen bg-slate-100" />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-sky-100 to-emerald-200 font-sans">

      {/* NAV */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-white/40 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 font-extrabold text-xl">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl px-3 py-1 shadow-md">
              QA
            </div>
            <span className="tracking-tight">QuickApplyAI</span>
          </div>

          <div className="hidden md:flex items-center gap-5 text-gray-700 font-medium">
            <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition">
              <FiUser /> Dashboard
            </Link>
            <Link href="/upload-cv" className="flex items-center gap-2 hover:text-green-600 transition">
              <FiUpload /> Upload CV
            </Link>
            <Link href="/find-jobs" className="flex items-center gap-2 text-green-600 font-semibold">
              <FiSearch /> Find Jobs
            </Link>
            <Link href="/applied" className="hover:text-green-600 transition">Applied Jobs</Link>
            <Link href="/notifications" className="flex items-center gap-2 hover:text-green-600 transition">
              <FiBell /> Notifications
            </Link>
          </div>

          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="md:hidden text-2xl text-gray-700"
          >
            {mobileMenu ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </nav>

      {mobileMenu && (
        <div className="md:hidden bg-white/95 backdrop-blur-lg border-b shadow-lg p-5 space-y-3">
          {[["Dashboard", "/dashboard"], ["Upload CV", "/upload-cv"], ["Find Jobs", "/find-jobs"], ["Applied Jobs", "/applied"], ["Notifications", "/notifications"]].map(([label, href]) => (
            <Link key={href} href={href} className="block px-4 py-3 rounded-xl hover:bg-green-100 transition font-medium">
              {label}
            </Link>
          ))}
        </div>
      )}

      {/* HEADER */}
      <header className="text-center mt-16 mb-10 px-4">
        <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight">
          Find Matching Jobs
        </h1>
        <p className="text-gray-700 mt-5 text-lg max-w-2xl mx-auto">
          We match real opportunities using your CV skills and preferences.
        </p>
      </header>

      {/* FILTERS */}
      <section className="px-6 md:px-20 mb-10">
        <div className="max-w-5xl mx-auto bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="text-gray-700 flex items-center gap-2 mb-2 font-semibold">
              <FiMapPin /> Country
            </label>
            <input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="p-4 border rounded-2xl w-full focus:ring-2 focus:ring-green-400 focus:outline-none"
              placeholder="Zimbabwe, South Africa, Remote"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchJobs}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-2xl font-bold shadow-lg hover:scale-[1.02] transition-transform"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* SKILLS */}
        <div className="max-w-5xl mx-auto mt-8 bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-lg">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSkill()}
              placeholder="Add a skill — e.g. React"
              className="flex-1 p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
            <button
              onClick={addSkill}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              Add Skill
            </button>
            <button
              onClick={() => { localStorage.removeItem("skills"); setSkills([]); }}
              className="text-sm text-gray-500 hover:text-gray-700 transition"
            >
              Clear
            </button>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {skills.length === 0 ? (
              <p className="text-sm text-gray-500">
                No skills loaded. Upload a CV or add skills manually.
              </p>
            ) : (
              skills.map(s => (
                <div
                  key={s}
                  className="bg-green-100 text-green-800 px-4 py-2 rounded-full flex items-center gap-2 font-semibold shadow-sm"
                >
                  {s}
                  <button
                    onClick={() => removeSkill(s)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* RESULTS */}
      <main className="px-6 md:px-20 pb-24">
        {loading ? (
          <p className="text-center text-lg text-gray-700 animate-pulse">
            Loading jobs...
          </p>
        ) : jobs.length === 0 ? (
          <div className="text-center text-gray-700">
            <p className="text-lg font-semibold">
              No jobs found. Showing global remote roles instead.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Tip: remove country or add more skills.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {jobs.map((job, idx) => (
              <div
                key={idx}
                className="bg-white/90 backdrop-blur-xl p-7 rounded-3xl shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <a href={job.link} target="_blank" rel="noreferrer">
                    <h2 className="text-2xl font-bold text-gray-900 hover:text-green-600 transition">
                      {job.title}
                    </h2>
                  </a>
                  <p className="text-gray-600 mt-1 font-medium">
                    {job.company || "Unknown Company"}
                  </p>
                  <p className="text-gray-500 mt-1">{job.location}</p>
                  <p className="text-gray-700 mt-4 leading-relaxed">
                    {job.description?.substring(0, 180)}...
                  </p>
                  <p className="text-xs text-gray-400 mt-3">
                    Source: {job.source}
                  </p>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => autoApply(job)}
                    className="flex-1 bg-green-600 text-white p-4 rounded-2xl font-bold shadow-lg hover:scale-[1.02] transition"
                  >
                    Auto Apply 🤖
                  </button>
                  <button
                    onClick={() => applyToJob(job)}
                    className="flex-1 bg-gray-200 text-gray-800 p-4 rounded-2xl font-bold shadow-lg hover:bg-gray-300 transition"
                  >
                    Manual Apply
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
