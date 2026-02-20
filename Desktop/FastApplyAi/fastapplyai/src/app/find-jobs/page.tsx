"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FiUpload,
  FiSearch,
  FiMapPin,
  FiX,
  FiPlus,
  FiUser,
  FiBell,
  FiBriefcase,
} from "react-icons/fi";

/* ================= TYPES ================= */
interface Job {
  title: string;
  company: string;
  description: string;
  location: string;
  link: string;
  source: string;
  match?: number;
  applyType?: "email" | "external" | "manual";
}

/* ================= PAGE ================= */
export default function FindJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [mounted, setMounted] = useState(false);
  const [cvUploaded, setCvUploaded] = useState(false);

  /* ================= LOAD LOCAL DATA ================= */
  useEffect(() => {
    setMounted(true);

    const savedSkills = localStorage.getItem("skills");
    const savedCV = localStorage.getItem("cvText");

    if (savedSkills) setSkills(JSON.parse(savedSkills));
    if (savedCV) setCvUploaded(true);
  }, []);

  /* ================= FETCH JOBS ================= */
  const fetchJobs = async (cvOverride?: string) => {
    setLoading(true);

    const cvText = cvOverride || localStorage.getItem("cvText") || "";

    try {
      const res = await fetch("/api/search-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cvText,
          keywords: skills,
          user: { name: "Candidate", email: "candidate@email.com" },
        }),
      });

      const data = await res.json();

      // Filter jobs with match >= 30%
      const filtered = data.filter((job: Job) => (job.match || 0) >= 30);
      setJobs(filtered);
    } catch (e) {
      console.error(e);
    }

    setLoading(false);
  };

  /* ================= APPLY ================= */
  const applyJob = async (job: Job) => {
    try {
      const res = await fetch("/api/apply-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job,
          user: { name: "Candidate", email: "candidate@email.com" },
        }),
      });

      const data = await res.json();

      if (data.redirect) window.open(data.redirect, "_blank");
      else alert("Application saved");
    } catch {
      window.open(job.link, "_blank");
    }
  };

  /* ================= CV UPLOAD ================= */
  const handleCVUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    localStorage.setItem("cvText", text);
    setCvUploaded(true);

    fetchJobs(text);
  };

  /* ================= ADD SKILL ================= */
  const addSkill = () => {
    const s = skillInput.trim();
    if (!s || skills.includes(s)) return;

    const updated = [...skills, s];
    setSkills(updated);
    localStorage.setItem("skills", JSON.stringify(updated));
    setSkillInput("");
  };

  /* ================= REMOVE SKILL ================= */
  const removeSkill = (s: string) => {
    const updated = skills.filter((k) => k !== s);
    setSkills(updated);
    localStorage.setItem("skills", JSON.stringify(updated));
  };

  /* ================= FETCH JOBS AFTER MOUNT ================= */
  useEffect(() => {
    if (mounted) fetchJobs();
  }, [mounted]);

  /* ================= SSR SAFE ================= */
  if (!mounted)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-700 text-xl">
        Loading CV analysis...
      </div>
    );

  /* ================= UI ================= */
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-300 via-blue-200 to-green-200">
      {/* Glow */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-400 opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-green-400 opacity-20 rounded-full blur-3xl"></div>
      </div>

      {/* NAVBAR */}
      <nav className="relative z-50 backdrop-blur-xl bg-white/60 border-b border-white/40 shadow-lg">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 font-bold text-xl">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-lg shadow">
              QA
            </div>
            QuickApplyAI
          </div>

          <div className="flex gap-6 items-center text-gray-700 font-medium">
            <Link href="/dashboard">
              <div className="flex gap-2 items-center hover:text-green-600 transition">
                <FiUser /> Dashboard
              </div>
            </Link>

            <Link href="/find-jobs">
              <div className="flex gap-2 items-center text-green-600 font-semibold">
                <FiSearch /> Find Jobs
              </div>
            </Link>

            <Link href="/notifications">
              <div className="flex gap-2 items-center hover:text-green-600 transition">
                <FiBell /> Notifications
              </div>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div className="relative z-10 text-center mt-20">
        <div className="inline-block p-8 rounded-3xl bg-white/40 backdrop-blur-xl shadow-xl">
          <FiBriefcase className="text-5xl text-green-600 mx-auto" />
        </div>

        <h1 className="text-5xl font-bold mt-8 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
          Find Your Dream Job
        </h1>

        <p className="text-gray-700 mt-4 text-lg">
          Let AI match the perfect job for you
        </p>
      </div>

      {/* CV UPLOAD */}
      <div className="relative z-10 max-w-xl mx-auto mt-14">
        <label className="block cursor-pointer group">
          <div className="bg-white/40 backdrop-blur-xl border border-white/40 rounded-3xl p-10 text-center shadow-xl hover:shadow-2xl hover:scale-[1.02] transition">
            <FiUpload className="text-5xl text-green-500 mx-auto mb-4 group-hover:scale-110 transition" />
            <p className="font-semibold text-lg">Upload your CV</p>
            <p className="text-gray-600 text-sm">Drag and drop or click</p>
          </div>
          <input type="file" className="hidden" onChange={handleCVUpload} />
        </label>

        {cvUploaded && (
          <div className="text-green-600 text-center mt-4 font-semibold">
            ✓ CV uploaded successfully
          </div>
        )}
      </div>

      {/* SKILLS */}
      <div className="relative z-10 max-w-xl mx-auto mt-10">
        <div className="bg-white/40 backdrop-blur-xl rounded-3xl shadow-xl p-6">
          <div className="flex gap-3">
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="Add skill..."
              className="flex-1 p-3 rounded-xl border border-white/40 focus:ring-2 focus:ring-green-400 outline-none bg-white/70"
            />
            <button
              onClick={addSkill}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 rounded-xl hover:scale-110 transition shadow"
            >
              <FiPlus />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {skills.map((s) => (
              <div
                key={s}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-1 rounded-full flex items-center gap-2 shadow hover:scale-110 transition"
              >
                {s}
                <FiX onClick={() => removeSkill(s)} className="cursor-pointer" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SEARCH BUTTON */}
      <div className="relative z-10 text-center mt-10">
        <button
          onClick={() => fetchJobs()}
          className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 text-white px-12 py-4 rounded-2xl font-bold text-lg shadow-xl hover:scale-110 transition"
        >
          Search Jobs
        </button>
      </div>

      {/* RESULTS */}
      <div className="relative z-10 max-w-7xl mx-auto mt-16 pb-20">
        {loading && (
          <div className="text-center text-xl font-semibold">
            Finding perfect jobs...
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {jobs.map((job, i) => (
            <div
              key={i}
              className="bg-white/50 backdrop-blur-xl rounded-3xl p-6 shadow-xl hover:shadow-2xl hover:scale-[1.03] transition"
            >
              <h2 className="font-bold text-xl">{job.title}</h2>
              <p className="text-gray-600">{job.company}</p>
              <div className="flex gap-2 mt-2 text-gray-600 text-sm">
                <FiMapPin /> {job.location}
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-sm">
                  <span>Match</span>
                  <span className="font-bold text-green-600">{job.match}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-3 mt-1">
                  <div
                    className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 h-3 rounded-full"
                    style={{ width: `${job.match}%` }}
                  />
                </div>
              </div>

              <button
                onClick={() => applyJob(job)}
                className="mt-6 w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:scale-105 transition shadow"
              >
                Apply Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}