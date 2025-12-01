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
  FiDollarSign,
} from "react-icons/fi";
import { useEffect, useState } from "react";

interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  url: string;
  salary: string;
  matchPercent: number;
}

export default function FindJobsPage() {
  const [skills, setSkills] = useState<string[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [country, setCountry] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [mobileMenu, setMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Mount
  useEffect(() => setMounted(true), []);

  // Load skills and check mobile
  useEffect(() => {
    if (!mounted) return;

    const storedSkills = localStorage.getItem("skills");
    if (storedSkills) setSkills(JSON.parse(storedSkills));

    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mounted]);

  // Fetch jobs from API
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/search-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills, country, minSalary, page }),
      });
      const data = await res.json();
      setJobs(data.jobs || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Job fetch error:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (mounted && skills.length > 0) fetchJobs();
  }, [skills, country, minSalary, page, mounted]);

  if (!mounted) return <div className="min-h-screen bg-gray-100"></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-300 via-blue-200 to-green-200 text-gray-900 font-sans overflow-x-hidden">
      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-6 py-4 shadow-md bg-white sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
        <div className="flex items-center gap-2 font-bold text-lg">
          <div className="bg-green-500 text-white rounded-md px-2 py-1">QA</div>
          QuickApplyAI
        </div>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-4 text-gray-700">
          <Link href="/dashboard" className="flex items-center gap-1 bg-green-500 text-white px-3 py-2 rounded-md">
            <FiUser /> Dashboard
          </Link>
          <Link href="/upload-cv" className="flex items-center gap-1 hover:text-green-600">
            <FiUpload /> Upload CV
          </Link>
          <Link href="/find-jobs" className="flex items-center gap-1 text-green-600 font-semibold">
            <FiSearch /> Find Jobs
          </Link>
          <Link href="/applied">Applied Jobs</Link>
          <Link href="/notifications" className="flex items-center gap-1 hover:text-green-600">
            <FiBell /> Notifications
          </Link>
          <Link href="/signin" className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
            Sign In
          </Link>
        </div>

        {/* Mobile */}
        <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden text-2xl">
          {mobileMenu ? <FiX /> : <FiMenu />}
        </button>
      </nav>

      {mobileMenu && (
        <div className="bg-white shadow-lg border-b p-5 space-y-4 text-gray-700">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/upload-cv">Upload CV</Link>
          <Link href="/find-jobs" className="font-semibold text-green-600">Find Jobs</Link>
          <Link href="/applied">Applied Jobs</Link>
          <Link href="/notifications">Notifications</Link>
          <Link href="/signin" className="text-green-600 font-semibold">Sign In</Link>
        </div>
      )}

      {/* Header */}
      <div className="text-center mt-14 sm:mt-20 mb-10 px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold">Find Matching Jobs</h1>
        <p className="text-gray-700 mt-4 text-lg md:w-2/3 mx-auto">
          AI-powered job search based on your CV skills.
        </p>
      </div>

      {/* Filters */}
      <div className="px-6 md:px-20 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-gray-600 flex items-center gap-2 mb-1"><FiMapPin /> Country</label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="p-3 border rounded-lg w-full"
              placeholder="e.g. Harare, Zimbabwe"
            />
          </div>

          <div>
            <label className="text-gray-600 flex items-center gap-2 mb-1"><FiDollarSign /> Minimum Salary</label>
            <input
              type="number"
              value={minSalary}
              onChange={(e) => setMinSalary(e.target.value)}
              className="p-3 border rounded-lg w-full"
              placeholder="e.g. 200"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setPage(1)}
              className="w-full bg-green-500 text-white p-3 rounded-lg"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Jobs */}
      <div className="px-6 md:px-20 pb-20">
        {loading ? (
          <p className="text-center text-lg text-gray-700">Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <p className="text-center text-lg text-gray-700">No matching jobs found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white p-6 rounded-2xl shadow-lg">
                <a href={job.url} target="_blank" rel="noopener noreferrer">
                  <h2 className="text-xl font-bold hover:text-green-600">{job.title}</h2>
                </a>
                <p className="text-gray-600">{job.company}</p>
                <p className="text-gray-500">{job.location}</p>
                <p className="text-gray-700 mt-3">{job.description}</p>
                <div className="mt-4 flex justify-between">
                  <span className="text-green-600 font-semibold">Match: {job.matchPercent}%</span>
                  <span className="text-gray-600">{job.salary}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex gap-3 justify-center mt-10">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-5 py-2 bg-white shadow-md border rounded-lg"
          >Prev</button>

          <span className="px-5 py-2 bg-green-500 text-white rounded-lg">{page}</span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-5 py-2 bg-white shadow-md border rounded-lg"
          >Next</button>
        </div>
      </div>
    </div>
  );
}
