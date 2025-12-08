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

  const applyToJob = async (job: Job) => {
    const applicant = {
      name: "John Doe",
      email: "john@example.com",
      phone: "123-456-7890",
      resumeUrl: "/resume.pdf",
    };

    await fetch("/api/apply-job", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobLink: job.link, applicant }),
    });

    window.open(job.link, "_blank");
  };

  if (!mounted) return <div className="min-h-screen bg-gray-100" />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-blue-100 to-green-200 font-sans">

      {/* NAV */}
      <nav className="flex items-center justify-between px-6 py-4 shadow-md bg-white sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-lg">
          <div className="bg-green-500 text-white rounded-md px-3 py-1 shadow-md">QA</div>
          QuickApplyAI
        </div>

        <div className="hidden md:flex items-center gap-4 text-gray-700 font-medium">
          <Link href="/dashboard" className="flex items-center gap-1 bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 transition"><FiUser /> Dashboard</Link>
          <Link href="/upload-cv" className="flex items-center gap-1 hover:text-green-600 transition"><FiUpload /> Upload CV</Link>
          <Link href="/find-jobs" className="flex items-center gap-1 text-green-600 font-semibold"><FiSearch /> Find Jobs</Link>
          <Link href="/applied" className="hover:text-green-600 transition">Applied Jobs</Link>
          <Link href="/notifications" className="flex items-center gap-1 hover:text-green-600 transition"><FiBell /> Notifications</Link>
        </div>

        <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden text-2xl">{mobileMenu ? <FiX /> : <FiMenu />}</button>
      </nav>

      {mobileMenu && (
        <div className="bg-white shadow-lg border-b p-5 space-y-4 text-gray-700">
          <Link href="/dashboard" className="block py-1 px-2 rounded hover:bg-green-100 transition">Dashboard</Link>
          <Link href="/upload-cv" className="block py-1 px-2 rounded hover:bg-green-100 transition">Upload CV</Link>
          <Link href="/find-jobs" className="block py-1 px-2 rounded text-green-600 font-semibold hover:bg-green-100 transition">Find Jobs</Link>
          <Link href="/applied" className="block py-1 px-2 rounded hover:bg-green-100 transition">Applied Jobs</Link>
          <Link href="/notifications" className="block py-1 px-2 rounded hover:bg-green-100 transition">Notifications</Link>
        </div>
      )}

      {/* Header */}
      <header className="text-center mt-14 sm:mt-20 mb-8 px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 drop-shadow-md">Find Matching Jobs</h1>
        <p className="text-gray-700 mt-4 text-lg md:w-2/3 mx-auto">Jobs are matched based on your CV skills and preferences.</p>
      </header>

      {/* Filters + Skills */}
      <section className="px-6 md:px-20 mb-10">
        <div className="bg-white p-6 rounded-3xl shadow-xl grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="text-gray-600 flex items-center gap-2 mb-1 font-medium"><FiMapPin/> Country</label>
            <input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="p-3 border rounded-xl w-full focus:ring-2 focus:ring-green-400 focus:outline-none"
              placeholder="e.g. Zimbabwe, South Africa, Remote"
            />
          </div>

          <div className="flex items-end">
            <button onClick={fetchJobs} className="w-full bg-green-500 text-white p-3 rounded-xl hover:bg-green-600 transition font-semibold shadow-md">Apply Filters</button>
          </div>
        </div>

        <div className="mt-6 bg-white p-4 rounded-2xl shadow">
          <div className="flex items-center gap-2">
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addSkill(); }}
              placeholder="Add skill (manual) — e.g. React"
              className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
            <button onClick={addSkill} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold shadow-sm">Add</button>
            <button onClick={() => { localStorage.removeItem("skills"); setSkills([]); }} className="ml-2 text-sm text-gray-500 hover:text-gray-700 transition">Clear saved skills</button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {skills.length === 0 ? (
              <div className="text-sm text-gray-500">No skills loaded. Upload a CV or add skills manually.</div>
            ) : skills.map(s => (
              <div key={s} className="bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center gap-2 font-medium shadow-sm">
                <span>{s}</span>
                <button onClick={() => removeSkill(s)} className="text-xs text-red-500 hover:text-red-700 transition">x</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      <main className="px-6 md:px-20 pb-20">
        {loading ? (
          <p className="text-center text-lg text-gray-700">Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <div className="text-center">
            <p className="text-lg text-gray-700">No jobs found. Showing all international remote jobs instead.</p>
            <p className="text-sm text-gray-500 mt-2">Tip: remove country or add more skills to match.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {jobs.map((job, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-3xl shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <a href={job.link || "#"} target="_blank" rel="noreferrer" className="hover:underline">
                    <h2 className="text-2xl font-bold text-gray-900 hover:text-green-600 transition">{job.title}</h2>
                  </a>
                  <p className="text-gray-600 mt-1 font-medium">{job.company || "Unknown Company"}</p>
                  <p className="text-gray-500 mt-1">{job.location}</p>
                  <p className="text-gray-700 mt-3">{job.description ? job.description.substring(0, 180) + "..." : ""}</p>
                  <p className="text-sm text-gray-400 mt-2">Source: {job.source}</p>
                </div>
                <button
                  onClick={() => applyToJob(job)}
                  className="mt-6 bg-green-500 text-white p-3 rounded-xl w-full hover:bg-green-600 font-semibold shadow-md transition"
                >
                  Apply
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
