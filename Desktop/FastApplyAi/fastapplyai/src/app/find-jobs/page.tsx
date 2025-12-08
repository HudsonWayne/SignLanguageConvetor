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

  // load skills from localStorage (CV extractor should set key "skills" to JSON array)
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("skills");
    if (stored) {
      try {
        setSkills(JSON.parse(stored));
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  // helper: add skill manually
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
        body: JSON.stringify({
          country,
          keywords: skills,
        }),
      });
      const data = await res.json();
      setJobs(data);
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

  // Semi-automatic apply
  const applyToJob = async (job: Job) => {
    const applicant = {
      name: "John Doe",
      email: "john@example.com",
      phone: "123-456-7890",
      resumeUrl: "/resume.pdf",
    };

    // Log the application (can store in DB later)
    await fetch("/api/apply-job", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobLink: job.link, applicant }),
    });

    // Open job link in new tab
    window.open(job.link, "_blank");
  };

  if (!mounted) return <div className="min-h-screen bg-gray-100" />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-300 via-blue-200 to-green-200 text-gray-900 font-sans">

      {/* NAV */}
      <nav className="flex items-center justify-between px-6 py-4 shadow-md bg-white sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-lg">
          <div className="bg-green-500 text-white rounded-md px-2 py-1">QA</div>
          QuickApplyAI
        </div>

        <div className="hidden md:flex items-center gap-4 text-gray-700">
          <Link href="/dashboard" className="flex items-center gap-1 bg-green-500 text-white px-3 py-2 rounded-md"><FiUser /> Dashboard</Link>
          <Link href="/upload-cv" className="flex items-center gap-1 hover:text-green-600"><FiUpload /> Upload CV</Link>
          <Link href="/find-jobs" className="flex items-center gap-1 text-green-600 font-semibold"><FiSearch /> Find Jobs</Link>
          <Link href="/applied">Applied Jobs</Link>
          <Link href="/notifications" className="flex items-center gap-1 hover:text-green-600"><FiBell /> Notifications</Link>
        </div>

        <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden text-2xl">{mobileMenu ? <FiX /> : <FiMenu />}</button>
      </nav>

      {mobileMenu && (
        <div className="bg-white shadow-lg border-b p-5 space-y-4 text-gray-700">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/upload-cv">Upload CV</Link>
          <Link href="/find-jobs" className="text-green-600 font-semibold">Find Jobs</Link>
          <Link href="/applied">Applied Jobs</Link>
          <Link href="/notifications">Notifications</Link>
        </div>
      )}

      {/* Header */}
      <div className="text-center mt-14 sm:mt-20 mb-6 px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold">Find Matching Jobs</h1>
        <p className="text-gray-700 mt-4 text-lg md:w-2/3 mx-auto">Jobs are matched based on your CV skills and preferences.</p>
      </div>

      {/* Filters + Skills */}
      <div className="px-6 md:px-20 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-xl grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-gray-600 flex items-center gap-2 mb-1"><FiMapPin/> Country</label>
            <input value={country} onChange={(e)=>setCountry(e.target.value)} className="p-3 border rounded-lg w-full" placeholder="e.g. Zimbabwe, South Africa, Remote"/>
          </div>

          <div className="flex items-end">
            <button onClick={fetchJobs} className="w-full bg-green-500 text-white p-3 rounded-lg">Apply Filters</button>
          </div>
        </div>

        {/* Skills area */}
        <div className="mt-4 bg-white p-4 rounded-xl shadow">
          <div className="flex items-center gap-2">
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addSkill(); }}
              placeholder="Add skill (manual) — e.g. React"
              className="flex-1 p-2 border rounded"
            />
            <button onClick={addSkill} className="bg-blue-600 text-white px-3 py-2 rounded">Add</button>
            <button onClick={() => { localStorage.removeItem("skills"); setSkills([]); }} className="ml-2 text-sm text-gray-500">Clear saved skills</button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {skills.length === 0 ? (
              <div className="text-sm text-gray-500">No skills loaded from CV. Upload a CV on Upload CV page or add skills manually.</div>
            ) : skills.map(s => (
              <div key={s} className="bg-gray-100 px-3 py-1 rounded flex items-center gap-2">
                <span className="text-sm">{s}</span>
                <button onClick={() => removeSkill(s)} className="text-xs text-red-500">x</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="px-6 md:px-20 pb-20">
        {loading ? (
          <p className="text-center text-lg text-gray-700">Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <div className="text-center">
            <p className="text-lg text-gray-700">No jobs found. Showing all international remote jobs instead.</p>
            <p className="text-sm text-gray-500 mt-2">Tip: remove country or add more skills to match.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map((job, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl shadow-lg flex flex-col justify-between">
                <div>
                  <a href={job.link || "#"} target="_blank" rel="noreferrer">
                    <h2 className="text-xl font-bold hover:text-green-600">{job.title}</h2>
                  </a>
                  <p className="text-gray-600">{job.company || "Unknown Company"}</p>
                  <p className="text-gray-500">{job.location}</p>
                  <p className="text-gray-700 mt-3">{job.description ? job.description.substring(0,200) + "..." : ""}</p>
                  <p className="text-sm text-gray-400 mt-2">Source: {job.source}</p>
                </div>
                <button
                  onClick={() => applyToJob(job)}
                  className="mt-4 bg-green-500 text-white p-3 rounded-lg w-full hover:bg-green-600 transition"
                >
                  Apply
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
