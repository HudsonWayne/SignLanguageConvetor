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
  FiMenu,
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
  const [mobileMenu, setMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);

  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const [mounted, setMounted] = useState(false);
  const [cvUploaded, setCvUploaded] = useState(false);

  useEffect(() => {
    setMounted(true);

    const savedSkills = localStorage.getItem("skills");
    const savedCV = localStorage.getItem("cvText");

    if (savedSkills) setSkills(JSON.parse(savedSkills));
    if (savedCV) setCvUploaded(true);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () =>
      window.removeEventListener("resize", handleResize);
  }, []);

  const fetchJobs = async (cvOverride?: string) => {
    setLoading(true);

    const cvText =
      cvOverride || localStorage.getItem("cvText") || "";

    try {
      const res = await fetch("/api/search-jobs", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          cvText,
          keywords: skills,
        }),
      });

      const data = await res.json();

      setJobs(data);
    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  };

  const handleCVUpload = async (e: any) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const text = await file.text();

    localStorage.setItem("cvText", text);

    setCvUploaded(true);

    fetchJobs(text);
  };

  const addSkill = () => {
    const s = skillInput.trim();

    if (!s || skills.includes(s)) return;

    const updated = [...skills, s];

    setSkills(updated);

    localStorage.setItem(
      "skills",
      JSON.stringify(updated)
    );

    setSkillInput("");
  };

  const removeSkill = (s: string) => {
    const updated = skills.filter((k) => k !== s);

    setSkills(updated);

    localStorage.setItem(
      "skills",
      JSON.stringify(updated)
    );
  };

  useEffect(() => {
    if (mounted) fetchJobs();
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-100 to-green-100">

      {/* NAVBAR */}

      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-gray-200">

        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between">

          <div className="flex items-center gap-2 font-bold text-xl">

            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 py-1 rounded">

              QA

            </div>

            QuickApplyAI

          </div>

          <div className="hidden md:flex gap-6 items-center">

            <Link
              href="/dashboard"
              className="flex gap-2 items-center hover:text-green-600"
            >
              <FiUser />
              Dashboard
            </Link>

            <Link
              href="/find-jobs"
              className="flex gap-2 items-center text-green-600 font-semibold"
            >
              <FiSearch />
              Find Jobs
            </Link>

            <Link
              href="/notifications"
              className="flex gap-2 items-center hover:text-green-600"
            >
              <FiBell />
              Notifications
            </Link>

          </div>

        </div>

      </nav>

      {/* HERO */}

      <div className="text-center mt-16">

        <div className="inline-block p-6 bg-white shadow-xl rounded-3xl">

          <FiBriefcase className="text-5xl text-green-500 mx-auto" />

        </div>

        <h1 className="text-5xl font-bold mt-6">

          Find Your Dream Job

        </h1>

        <p className="text-gray-600 mt-3">

          AI finds and matches jobs automatically

        </p>

      </div>

      {/* CV */}

      <div className="max-w-xl mx-auto mt-12 px-6">

        <label className="group cursor-pointer block">

          <div className="bg-white border-2 border-dashed border-green-300 rounded-3xl p-10 text-center hover:border-green-500 hover:shadow-xl transition">

            <FiUpload className="text-4xl text-green-500 mx-auto mb-3 group-hover:scale-110 transition" />

            <p className="font-semibold text-lg">

              Upload your CV

            </p>

            <p className="text-gray-500 text-sm">

              PDF, DOC, TXT

            </p>

          </div>

          <input
            type="file"
            className="hidden"
            onChange={handleCVUpload}
          />

        </label>

        {cvUploaded && (

          <div className="text-green-600 text-center mt-3 font-semibold">

            ✓ CV Uploaded

          </div>

        )}

      </div>

      {/* SKILLS */}

      <div className="max-w-xl mx-auto mt-10 bg-white shadow-xl rounded-3xl p-6">

        <div className="flex gap-3">

          <input
            value={skillInput}
            onChange={(e) =>
              setSkillInput(e.target.value)
            }
            placeholder="Add a skill..."
            className="flex-1 border rounded-xl p-3 focus:ring-2 focus:ring-green-400 outline-none"
          />

          <button
            onClick={addSkill}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 rounded-xl hover:scale-105 transition"
          >
            <FiPlus />
          </button>

        </div>

        <div className="flex flex-wrap gap-2 mt-4">

          {skills.map((s) => (

            <div
              key={s}
              className="bg-green-100 text-green-700 px-4 py-1 rounded-full flex items-center gap-2 hover:scale-105 transition"
            >

              {s}

              <FiX
                onClick={() => removeSkill(s)}
                className="cursor-pointer"
              />

            </div>

          ))}

        </div>

      </div>

      {/* SEARCH */}

      <div className="text-center mt-10">

        <button
          onClick={() => fetchJobs()}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-10 py-4 rounded-2xl text-lg font-semibold shadow-lg hover:scale-110 hover:shadow-2xl transition"
        >

          Search Jobs

        </button>

      </div>

      {/* RESULTS */}

      <div className="max-w-7xl mx-auto mt-16 px-6 pb-20">

        {loading && (

          <div className="text-center text-xl font-semibold animate-pulse">

            Finding best jobs for you...

          </div>

        )}

        <div className="grid md:grid-cols-3 gap-8">

          {jobs.map((job, i) => (

            <div
              key={i}
              className="bg-white rounded-3xl shadow-xl p-6 hover:shadow-2xl hover:-translate-y-2 transition"
            >

              <h2 className="font-bold text-xl">

                {job.title}

              </h2>

              <p className="text-gray-600 mt-1">

                {job.company}

              </p>

              <div className="flex gap-2 mt-2 text-gray-500 text-sm">

                <FiMapPin />

                {job.location}

              </div>

              {/* MATCH */}

              <div className="mt-4">

                <div className="flex justify-between text-sm">

                  <span>Match</span>

                  <span className="font-semibold text-green-600">

                    {job.match}%

                  </span>

                </div>

                <div className="bg-gray-200 rounded-full h-3 mt-1 overflow-hidden">

                  <div
                    className="bg-gradient-to-r from-green-400 to-emerald-600 h-3 rounded-full transition-all duration-1000"
                    style={{
                      width: `${job.match}%`,
                    }}
                  />

                </div>

              </div>

              <button
                onClick={() =>
                  window.open(job.link)
                }
                className="mt-6 w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:scale-105 transition"
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
