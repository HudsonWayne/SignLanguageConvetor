"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FiSearch, FiMapPin, FiX, FiPlus, FiUser, FiBell, FiBriefcase, FiUpload } from "react-icons/fi";

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
  const [cvUploaded, setCvUploaded] = useState(false);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    const savedSkills = localStorage.getItem("skills");
    const savedCV = localStorage.getItem("cvText");

    if (savedSkills) setSkills(JSON.parse(savedSkills));
    if (savedCV) setCvUploaded(true);
  }, []);

  /* ================= FETCH JOBS ================= */
  const fetchJobs = async () => {
    setLoading(true);

    const cvText = localStorage.getItem("cvText");

    if (!cvText) {
      alert("Please upload your CV first.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/search-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cvText,
          keywords: skills,
        }),
      });

      const data: Job[] = await res.json();

      setJobs(data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch jobs.");
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

  /* ================= AUTO FETCH ================= */
  useEffect(() => {
    if (cvUploaded) fetchJobs();
  }, [cvUploaded]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-300 via-blue-200 to-green-200">

      {/* NAVBAR */}
      <nav className="bg-white shadow p-4 flex justify-between">
        <div className="font-bold text-xl">QuickApplyAI</div>
        <div className="flex gap-6">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/find-jobs" className="text-green-600 font-bold">Find Jobs</Link>
          <Link href="/notifications">Notifications</Link>
        </div>
      </nav>

      {/* HERO */}
      <div className="text-center mt-12">
        <FiBriefcase className="text-5xl text-green-600 mx-auto" />
        <h1 className="text-4xl font-bold mt-4">
          Find Your Dream Job
        </h1>
        <p className="text-gray-700 mt-2">
          AI-matched jobs based on your CV and skills
        </p>

        {!cvUploaded && (
          <Link href="/upload-cv">
            <button className="mt-6 bg-green-500 text-white px-6 py-3 rounded-lg">
              <FiUpload className="inline mr-2" />
              Upload CV
            </button>
          </Link>
        )}
      </div>

      {/* SKILLS */}
      <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded-xl shadow">
        <div className="flex gap-3">
          <input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            placeholder="Add skill..."
            className="flex-1 border p-2 rounded"
          />
          <button
            onClick={addSkill}
            className="bg-green-500 text-white px-4 rounded"
          >
            <FiPlus />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {skills.map((s) => (
            <div key={s} className="bg-green-500 text-white px-3 py-1 rounded-full flex items-center gap-2">
              {s}
              <FiX className="cursor-pointer" onClick={() => removeSkill(s)} />
            </div>
          ))}
        </div>
      </div>

      {/* SEARCH BUTTON */}
      {cvUploaded && (
        <div className="text-center mt-6">
          <button
            onClick={fetchJobs}
            className="bg-blue-500 text-white px-8 py-3 rounded-lg"
          >
            Refresh Jobs
          </button>
        </div>
      )}

      {/* RESULTS */}
      <div className="max-w-6xl mx-auto mt-12 grid md:grid-cols-3 gap-6 pb-20">
        {loading && <p className="text-center col-span-3">Finding jobs...</p>}

        {!loading && jobs.length === 0 && cvUploaded && (
          <p className="text-center col-span-3">No jobs found</p>
        )}

        {jobs.map((job, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow">
            <h2 className="font-bold text-lg">{job.title}</h2>
            <p className="text-gray-600">{job.company}</p>
            <div className="flex gap-2 text-sm text-gray-600 mt-2">
              <FiMapPin /> {job.location}
            </div>

            {job.match && (
              <p className="mt-2 font-semibold text-green-600">
                Match: {job.match}%
              </p>
            )}

            <button
              onClick={() => applyJob(job)}
              className="mt-4 w-full bg-green-500 text-white py-2 rounded"
            >
              Apply Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}