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
  title: string;
  company: string;
  description: string;
  location: string;
  link: string;
  salary?: number | null;
  source: string;
}

export default function FindJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [country, setCountry] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // ---- Fetch Jobs ----
  const fetchJobs = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/search-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country,
          minSalary,
        }),
      });

      const data = await res.json();
      setJobs(data);
    } catch (err) {
      console.error("Job fetch error:", err);
    }

    setLoading(false);
  };

  // Fetch on page load
  useEffect(() => {
    if (mounted) fetchJobs();
  }, [mounted]);

  if (!mounted) return <div className="min-h-screen bg-gray-100"></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-300 via-blue-200 to-green-200 text-gray-900 font-sans">

      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-6 py-4 shadow-md bg-white sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-lg">
          <div className="bg-green-500 text-white rounded-md px-2 py-1">QA</div>
          QuickApplyAI
        </div>

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
        </div>

        <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden text-2xl">
          {mobileMenu ? <FiX /> : <FiMenu />}
        </button>
      </nav>

      {/* MOBILE MENU */}
      {mobileMenu && (
        <div className="bg-white shadow-lg border-b p-5 space-y-4 text-gray-700">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/upload-cv">Upload CV</Link>
          <Link href="/find-jobs" className="font-semibold text-green-600">Find Jobs</Link>
          <Link href="/applied">Applied Jobs</Link>
          <Link href="/notifications">Notifications</Link>
        </div>
      )}

      {/* HEADER */}
      <div className="text-center mt-14 sm:mt-20 mb-10 px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold">Find Matching Jobs</h1>
        <p className="text-gray-700 mt-4 text-lg md:w-2/3 mx-auto">
          Real-time jobs from Jobicy, WorkAnywhere, and FindWork.
        </p>
      </div>

      {/* FILTERS */}
      <div className="px-6 md:px-20 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div>
            <label className="text-gray-600 flex items-center gap-2 mb-1">
              <FiMapPin /> Country
            </label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="p-3 border rounded-lg w-full"
              placeholder="e.g. Zimbabwe, Remote"
            />
          </div>

          <div>
            <label className="text-gray-600 flex items-center gap-2 mb-1">
              <FiDollarSign /> Minimum Salary
            </label>
            <input
              type="number"
              value={minSalary}
              onChange={(e) => setMinSalary(e.target.value)}
              className="p-3 border rounded-lg w-full"
              placeholder="Only FindWork supports salary"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchJobs}
              className="w-full bg-green-500 text-white p-3 rounded-lg"
            >
              Apply Filters
            </button>
          </div>

        </div>
      </div>

      {/* JOB RESULTS */}
      <div className="px-6 md:px-20 pb-20">
        {loading ? (
          <p className="text-center text-lg text-gray-700">Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <p className="text-center text-lg text-gray-700">
            No matching jobs found.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map((job, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-lg">
                <a href={job.link} target="_blank" rel="noopener noreferrer">
                  <h2 className="text-xl font-bold hover:text-green-600">
                    {job.title}
                  </h2>
                </a>

                <p className="text-gray-600">
                  {job.company || "Unknown Company"}
                </p>

                <p className="text-gray-500">{job.location}</p>

                {job.salary ? (
                  <p className="text-green-600 mt-2 font-semibold">
                    Salary: ${job.salary}
                  </p>
                ) : (
                  <p className="text-gray-400 mt-2 text-sm">
                    (No salary info)
                  </p>
                )}

                <p className="text-gray-700 mt-3">
                  {job.description.substring(0, 200)}...
                </p>

                <div className="mt-4 flex justify-between">
                  <span className="text-green-600 font-semibold">
                    {job.source}
                  </span>
                  <span className="text-gray-600">Remote / Flexible</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
