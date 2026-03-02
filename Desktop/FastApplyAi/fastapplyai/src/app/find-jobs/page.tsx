"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FiSearch,
  FiMapPin,
  FiX,
  FiPlus,
  FiBriefcase,
} from "react-icons/fi";

interface Job {
  title: string;
  company: string;
  description: string;
  location: string;
  link: string;
  source: string;
  match?: number;
}

export default function FindJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  /* ================= LOAD SKILLS ================= */
  useEffect(() => {
    const savedSkills = localStorage.getItem("skills");
    if (savedSkills) setSkills(JSON.parse(savedSkills));

    fetchJobs();
  }, []);

  /* ================= FETCH JOBS ================= */
  const fetchJobs = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/search-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cvText: "", // no CV required
          keywords: skills,
        }),
      });

      const data: Job[] = await res.json();
      setJobs(data);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  /* ================= APPLY ================= */
  const applyJob = (job: Job) => {
    window.open(job.link, "_blank");
  };

  /* ================= SKILLS ================= */
  const addSkill = () => {
    const s = skillInput.trim().toLowerCase();
    if (!s || skills.includes(s)) return;

    const updated = [...skills, s];
    setSkills(updated);
    localStorage.setItem("skills", JSON.stringify(updated));
    setSkillInput("");
  };

  const removeSkill = (s: string) => {
    const updated = skills.filter((k) => k !== s);
    setSkills(updated);
    localStorage.setItem("skills", JSON.stringify(updated));
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-100 to-emerald-100">

      {/* ================= NAVBAR ================= */}
      <nav className="bg-white/70 backdrop-blur-xl shadow-md sticky top-0 z-50 border-b border-white/40">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 font-bold text-xl">
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-3 py-1 rounded-lg shadow">
              QA
            </div>
            QuickApplyAI
          </div>

          <div className="flex gap-6 font-medium text-gray-700">
            <Link href="/dashboard" className="hover:text-emerald-600 transition">
              Dashboard
            </Link>
            <Link href="/find-jobs" className="text-emerald-600 font-semibold">
              Find Jobs
            </Link>
            <Link href="/notifications" className="hover:text-emerald-600 transition">
              Notifications
            </Link>
          </div>
        </div>
      </nav>

      {/* ================= HERO ================= */}
      <div className="text-center mt-20">
        <div className="inline-block p-6 rounded-3xl bg-white/60 backdrop-blur-xl shadow-lg">
          <FiBriefcase className="text-5xl text-emerald-600" />
        </div>

        <h1 className="text-5xl font-bold mt-8 bg-gradient-to-r from-emerald-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Explore Job Opportunities
        </h1>

        <p className="text-gray-700 mt-4 text-lg">
          Browse latest jobs and filter by your skills
        </p>
      </div>

      {/* ================= SKILL FILTER ================= */}
      <div className="max-w-xl mx-auto mt-12 bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl p-8">
        <div className="flex gap-3">
          <input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            placeholder="Add a skill to filter jobs..."
            className="flex-1 p-3 rounded-xl border border-white/40 focus:ring-2 focus:ring-emerald-400 outline-none bg-white/80"
          />
          <button
            onClick={addSkill}
            className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 rounded-xl hover:scale-105 transition shadow"
          >
            <FiPlus />
          </button>
        </div>

        <div className="flex flex-wrap gap-3 mt-5">
          {skills.map((s) => (
            <div
              key={s}
              className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-1 rounded-full flex items-center gap-2 shadow hover:scale-105 transition"
            >
              {s}
              <FiX
                className="cursor-pointer"
                onClick={() => removeSkill(s)}
              />
            </div>
          ))}
        </div>

        <div className="text-center mt-6">
          <button
            onClick={fetchJobs}
            className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-10 py-3 rounded-2xl font-semibold shadow-lg hover:scale-105 transition"
          >
            <FiSearch className="inline mr-2" />
            Search Jobs
          </button>
        </div>
      </div>

      {/* ================= RESULTS ================= */}
      <div className="max-w-7xl mx-auto mt-16 pb-24 px-6 grid md:grid-cols-3 gap-10">

        {loading && (
          <div className="col-span-3 text-center text-xl font-semibold text-gray-700">
            Finding latest jobs...
          </div>
        )}

        {!loading && jobs.length === 0 && (
          <div className="col-span-3 text-center text-lg text-gray-600">
            No jobs found. Try different skills.
          </div>
        )}

        {!loading &&
          jobs.map((job, i) => (
            <div
              key={i}
              className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl hover:shadow-2xl hover:scale-[1.03] transition duration-300"
            >
              <h2 className="font-bold text-xl">{job.title}</h2>
              <p className="text-gray-600 mt-1">{job.company}</p>

              <div className="flex gap-2 mt-3 text-gray-600 text-sm">
                <FiMapPin /> {job.location}
              </div>

              <p className="text-gray-700 text-sm mt-4 line-clamp-4">
                {job.description}
              </p>

              {job.match && (
                <div className="mt-4 text-sm font-semibold text-emerald-600">
                  Match: {job.match}%
                </div>
              )}

              <button
                onClick={() => applyJob(job)}
                className="mt-6 w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 rounded-xl font-semibold hover:scale-105 transition shadow"
              >
                Apply Now
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}