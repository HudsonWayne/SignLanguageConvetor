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
  /* ================= MOBILE NAV ================= */

  const [mobileMenu, setMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  /* ================= STATE ================= */

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [mounted, setMounted] = useState(false);
  const [cvUploaded, setCvUploaded] = useState(false);

  /* ================= LOAD ================= */

  useEffect(() => {
    setMounted(true);

    const savedSkills = localStorage.getItem("skills");
    const savedCV = localStorage.getItem("cvText");

    if (savedSkills) setSkills(JSON.parse(savedSkills));
    if (savedCV) setCvUploaded(true);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setMobileMenu(false);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ================= FETCH JOBS ================= */

  const fetchJobs = async (cvOverride?: string) => {
    setLoading(true);

    const cvText = cvOverride || localStorage.getItem("cvText") || "";

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

  /* ================= UPLOAD ================= */

  const handleCVUpload = async (e: any) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const text = await file.text();

    localStorage.setItem("cvText", text);

    setCvUploaded(true);

    fetchJobs(text);
  };

  /* ================= SKILLS ================= */

  const addSkill = () => {
    const s = skillInput.trim();

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

  /* ================= AUTO LOAD ================= */

  useEffect(() => {
    if (mounted) fetchJobs();
  }, [mounted]);

  if (!mounted) return null;

  /* ================= UI ================= */

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-purple-300 via-blue-200 to-green-200 text-gray-900 font-sans overflow-x-hidden bg-[length:200%_200%] ${
        isMobile ? "" : "animate-gradientFlow"
      }`}
    >
      {/* ================= NAVBAR ================= */}

      <nav className="relative flex items-center justify-between px-6 md:px-20 py-4 shadow-md bg-white sticky top-0 z-50 backdrop-blur-md bg-opacity-90">

        <div className="flex items-center gap-2 text-xl font-bold">

          <div className="bg-green-500 text-white rounded-md px-2 py-1">
            QA
          </div>

          QuickApplyAI

        </div>

        <div className="hidden md:flex items-center gap-6 text-gray-700 font-medium">

          <Link href="/dashboard" className="flex items-center gap-1 bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600">
            <FiUser /> Dashboard
          </Link>

          <Link href="/upload-cv" className="flex items-center gap-1 hover:text-green-600">
            <FiUpload /> Upload CV
          </Link>

          <Link href="/find-jobs" className="flex items-center gap-1 text-green-600 font-semibold">
            <FiSearch /> Find Jobs
          </Link>

          <Link href="/notifications" className="flex items-center gap-1 hover:text-green-600">
            <FiBell /> Notifications
          </Link>

        </div>

        <button className="md:hidden text-2xl" onClick={() => setMobileMenu(!mobileMenu)}>
          <FiMenu />
        </button>

      </nav>

      {/* HERO */}

      <div className="text-center mt-14 px-4">

        <h1 className="text-4xl md:text-5xl font-extrabold">

          Find Your Dream Job

        </h1>

        <p className="text-gray-600 mt-3">

          Upload CV, add skills, and let AI match jobs instantly

        </p>

      </div>

      {/* CV UPLOAD */}

      <div className="max-w-xl mx-auto mt-10 px-4">

        <label className="bg-white rounded-2xl shadow-lg p-8 text-center cursor-pointer block hover:shadow-xl transition">

          <FiUpload className="mx-auto text-4xl text-green-500 mb-3" />

          <p className="font-semibold">

            Upload CV

          </p>

          <input type="file" className="hidden" onChange={handleCVUpload} />

        </label>

        {cvUploaded && (
          <p className="text-green-600 text-center mt-3 font-medium">
            CV uploaded successfully
          </p>
        )}

      </div>

      {/* SKILLS */}

      <div className="max-w-xl mx-auto mt-8 bg-white rounded-2xl shadow-lg p-6">

        <div className="flex gap-3">

          <input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            placeholder="Add skill"
            className="flex-1 p-3 border rounded-lg"
          />

          <button
            onClick={addSkill}
            className="bg-green-500 text-white px-4 rounded-lg hover:bg-green-600"
          >
            <FiPlus />
          </button>

        </div>

        <div className="flex flex-wrap gap-2 mt-4">

          {skills.map((s) => (
            <div key={s} className="bg-green-100 text-green-700 px-4 py-1 rounded-full flex gap-2">

              {s}

              <FiX onClick={() => removeSkill(s)} className="cursor-pointer" />

            </div>
          ))}

        </div>

      </div>

      {/* SEARCH */}

      <div className="text-center mt-8">

        <button
          onClick={() => fetchJobs()}
          className="bg-green-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-600 shadow-md"
        >
          Search Jobs
        </button>

      </div>

      {/* RESULTS */}

      <div className="max-w-7xl mx-auto mt-12 px-6 pb-20">

        {loading && (
          <div className="text-center text-xl font-semibold">
            Searching jobs...
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">

          {jobs.map((job, i) => (

            <div key={i} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">

              <h2 className="font-bold text-lg">

                {job.title}

              </h2>

              <p className="text-gray-600">

                {job.company}

              </p>

              <div className="flex gap-2 text-sm text-gray-500 mt-1">

                <FiMapPin />

                {job.location}

              </div>

              {/* MATCH */}

              <div className="mt-4">

                <div className="text-sm font-medium">

                  Match {job.match}%

                </div>

                <div className="bg-gray-200 h-2 rounded-full mt-1">

                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${job.match}%` }}
                  />

                </div>

              </div>

              <button
                onClick={() => window.open(job.link)}
                className="mt-5 w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
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
