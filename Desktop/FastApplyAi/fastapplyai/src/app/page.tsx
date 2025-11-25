"use client";

import Link from "next/link";
import {
  FiUpload,
  FiSearch,
  FiCheckCircle,
  FiBell,
  FiUser,
  FiMenu,
  FiX,
  FiMapPin,
  FiDollarSign,
} from "react-icons/fi";
import { useEffect, useState } from "react";

export default function FindJobsPage() {
  const [skills, setSkills] = useState<string[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [country, setCountry] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [page, setPage] = useState(1);

  const [mobileMenu, setMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const storedSkills = localStorage.getItem("skills");
    if (storedSkills) setSkills(JSON.parse(storedSkills));

    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/search-jobs", {
        method: "POST",
        body: JSON.stringify({ skills, country, minSalary, page }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (skills.length > 0) fetchJobs();
  }, [skills, country, minSalary, page]);

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-purple-300 via-blue-200 to-green-200 text-gray-900 font-sans overflow-x-hidden bg-[length:200%_200%] ${
        isMobile ? "" : "animate-gradientFlow"
      }`}
    >
      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-4 sm:px-6 md:px-10 lg:px-20 xl:px-24 2xl:px-40 py-4 shadow-md bg-white sticky top-0 z-50 backdrop-blur-md bg-opacity-90 w-full max-w-[1920px] mx-auto">
        <div className="flex items-center gap-2 text-lg sm:text-xl font-bold transition-all hover:scale-105">
          <div className="bg-green-500 text-white rounded-md px-2 py-1 shadow-sm">
            QA
          </div>
          <span className="tracking-wide whitespace-nowrap">
            QuickApplyAI
          </span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-4 lg:gap-8 text-sm text-gray-700 font-medium">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            <FiUser /> Dashboard
          </Link>
          <Link
            href="/upload-cv"
            className="flex items-center gap-1 hover:text-green-600 transition-all hover:-translate-y-0.5"
          >
            <FiUpload /> Upload CV
          </Link>
          <Link
            href="/find-jobs"
            className="flex items-center gap-1 text-green-600 font-semibold"
          >
            <FiSearch /> Find Jobs
          </Link>
          <Link
            href="/applied"
            className="hover:text-green-600 transition-all hover:-translate-y-0.5"
          >
            Applied Jobs
          </Link>
          <Link
            href="/notifications"
            className="flex items-center gap-1 hover:text-green-600 transition-all hover:-translate-y-0.5"
          >
            <FiBell /> Notifications
          </Link>

          <Link
            href="/signin"
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            Sign In
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-2xl text-gray-700"
          onClick={() => setMobileMenu(!mobileMenu)}
        >
          {mobileMenu ? <FiX /> : <FiMenu />}
        </button>
      </nav>

      {/* Mobile Dropdown */}
      {mobileMenu && (
        <div className="bg-white shadow-lg border-b p-5 space-y-4 text-gray-700">
          <Link href="/dashboard" className="block">
            Dashboard
          </Link>
          <Link href="/upload-cv" className="block">
            Upload CV
          </Link>
          <Link href="/find-jobs" className="block font-semibold text-green-600">
            Find Jobs
          </Link>
          <Link href="/applied" className="block">
            Applied Jobs
          </Link>
          <Link href="/notifications" className="block">
            Notifications
          </Link>
          <Link href="/signin" className="block text-green-600 font-semibold">
            Sign In
          </Link>
        </div>
      )}

      {/* HEADER */}
      <div className="text-center mt-14 sm:mt-20 mb-10 px-4 animate-fadeUp">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
          Find Matching Jobs
        </h1>
        <p className="text-gray-700 mt-4 text-base sm:text-lg md:w-2/3 mx-auto leading-relaxed">
          AI-powered job search based on your CV skills. Apply filters, explore
          job matches, and boost your chances.
        </p>
      </div>

      {/* FILTERS */}
      <div className="px-6 sm:px-10 md:px-14 lg:px-20 xl:px-24 2xl:px-40 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-gray-600 flex items-center gap-2 mb-1 font-medium">
              <FiMapPin /> Country
            </label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g. Zimbabwe, South Africa, Remote"
              className="p-3 border rounded-lg w-full"
            />
          </div>

          <div>
            <label className="text-gray-600 flex items-center gap-2 mb-1 font-medium">
              <FiDollarSign /> Minimum Salary
            </label>
            <input
              type="number"
              value={minSalary}
              onChange={(e) => setMinSalary(e.target.value)}
              placeholder="e.g. 500"
              className="p-3 border rounded-lg w-full"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setPage(1)}
              className="w-full bg-green-500 text-white p-3 rounded-lg font-semibold hover:bg-green-600 shadow-md transition-all"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* JOB LIST */}
      <div className="px-6 sm:px-10 md:px-14 lg:px-20 xl:px-24 2xl:px-40 pb-20">
        {loading ? (
          <p className="text-center text-lg text-gray-700">Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <p className="text-center text-lg text-gray-700">
            No matching jobs found.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition cursor-pointer"
              >
                <a href={job.url} target="_blank">
                  <h2 className="text-xl font-bold hover:text-green-600">
                    {job.title}
                  </h2>
                </a>

                <p className="text-gray-600 mt-1">{job.company}</p>
                <p className="text-gray-500">{job.location}</p>

                <p className="text-gray-700 mt-3 leading-relaxed">
                  {job.description}
                </p>

                <div className="mt-4 flex justify-between items-center">
                  <span className="text-green-600 font-semibold">
                    Match: {job.matchPercent}%
                  </span>
                  <span className="text-gray-600">{job.salary}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PAGINATION */}
        <div className="flex gap-3 justify-center mt-10">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-5 py-2 bg-white shadow-md border rounded-lg hover:bg-gray-100"
          >
            Prev
          </button>

          <span className="px-5 py-2 bg-green-500 text-white rounded-lg shadow">
            {page}
          </span>

          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-5 py-2 bg-white shadow-md border rounded-lg hover:bg-gray-100"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
