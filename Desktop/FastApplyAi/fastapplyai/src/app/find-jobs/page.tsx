"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FiUpload,
  FiSearch,
  FiBell,
  FiUser,
  FiMenu,
  FiX,
  FiMapPin,
} from "react-icons/fi";

interface Job {
  title: string;
  company: string;
  description: string;
  location: string;
  link: string;
  source: string;
  remote?: boolean;
  skills?: string[];
  match?: number;
  postedAt?: string;
  matchedSkills?: string[];
}

export default function FindJobsPage() {

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<"all" | "local" | "remote">("all");
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [recency, setRecency] = useState<"any" | "1" | "7" | "30">("any");
  const [minMatch, setMinMatch] = useState(70);
  const [requireAllSkills, setRequireAllSkills] = useState(false);
  const [cvAlignedOnly, setCvAlignedOnly] = useState(true);
  const [searchNote, setSearchNote] = useState("");
  const [lastEffectiveMinMatch, setLastEffectiveMinMatch] = useState(minMatch);


  // ✅ HTML CLEANER
  const cleanJobDescription = (html?: string) => {

    if (!html) return "";

    try {

      const doc = new DOMParser().parseFromString(html, "text/html");

      return doc.body.textContent
        ?.replace(/\s+/g, " ")
        .trim() || "";

    } catch {

      return html.replace(/<[^>]+>/g, " ");

    }

  };


  // ✅ SMART TRIM
  const trimDescription = (text: string, length = 180) => {

    if (text.length <= length) return text;

    const trimmed = text.substring(0, length);

    return trimmed.substring(0, trimmed.lastIndexOf(" ")) + "...";

  };


  useEffect(() => {

    setMounted(true);

    const storedSkills = localStorage.getItem("skills");

    const applied = localStorage.getItem("appliedJobs");

    if (storedSkills) setSkills(JSON.parse(storedSkills));

    if (applied) setAppliedJobs(JSON.parse(applied));

  }, []);



  const addSkill = () => {

    const s = skillInput.trim();

    if (!s || skills.includes(s)) return;

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

          city,

          keywords: skills,

          minMatch,

          remoteOnly,

        }),

      });

      const data = await res.json();

      setJobs(Array.isArray(data) ? data : []);

    }

    catch {

      setJobs([]);

    }

    setLoading(false);

  };


  useEffect(() => {

    if (mounted) fetchJobs();

  }, [mounted]);



  const filteredJobs = jobs.filter(job => {

    const loc = job.location?.toLowerCase() || "";

    if (filter === "remote") {

      return job.remote || loc.includes("remote");

    }

    if (filter === "local") {

      return loc.includes("zimbabwe");

    }

    return true;

  });



  const applyJob = (job: Job) => {

    window.open(job.link, "_blank");

    if (!appliedJobs.includes(job.link)) {

      const next = [...appliedJobs, job.link];

      setAppliedJobs(next);

      localStorage.setItem("appliedJobs", JSON.stringify(next));

    }

  };



  const formatAge = (iso?: string) => {

    if (!iso) return "";

    const diff = Date.now() - new Date(iso).getTime();

    const h = diff / (1000 * 60 * 60);

    if (h < 24) return Math.round(h) + "h ago";

    return Math.round(h / 24) + "d ago";

  };



  const matchedSkillsForJob = (job: Job) => {

    const text = cleanJobDescription(job.description).toLowerCase();

    return skills.filter(skill =>

      text.includes(skill.toLowerCase())

    );

  };



  if (!mounted) return null;



  return (

    <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-sky-100 to-emerald-200">



      {/* HEADER */}

      <header className="text-center mt-16 mb-10">

        <h1 className="text-5xl font-black">

          Find Matching Jobs

        </h1>

      </header>



      {/* JOB RESULTS */}

      <main className="px-6 pb-24">


        {loading && (

          <p className="text-center">

            Loading jobs...

          </p>

        )}



        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">


          {filteredJobs.map((job, index) => {


            const clean = cleanJobDescription(job.description);

            const trimmed = trimDescription(clean);


            return (

              <div key={index}

              className="bg-white p-6 rounded-2xl shadow-xl">


                <a href={job.link} target="_blank">

                  <h2 className="text-xl font-bold hover:text-green-600">

                    {job.title}

                  </h2>

                </a>


                <p>{job.company}</p>


                <p className="text-sm text-gray-500">

                  {job.location}

                </p>


                {/* ✅ FIXED DESCRIPTION */}

                <p className="mt-3 text-gray-700">

                  {trimmed}

                </p>


                <p className="text-xs text-gray-400">

                  Source: {job.source}

                </p>


                {job.postedAt && (

                  <p className="text-xs text-gray-400">

                    {formatAge(job.postedAt)}

                  </p>

                )}



                {/* MATCH */}

                <p className="text-green-600 font-bold mt-2">

                  {job.match || 0}% Match

                </p>



                {/* MATCHED SKILLS */}

                <div className="flex flex-wrap gap-2 mt-2">

                  {matchedSkillsForJob(job).map(skill => (

                    <span key={skill}

                    className="bg-green-100 px-2 py-1 rounded text-xs">

                      {skill}

                    </span>

                  ))}

                </div>



                {/* APPLY */}

                <button

                onClick={() => applyJob(job)}

                className="mt-4 w-full bg-green-500 text-white py-2 rounded-xl">

                  Apply 🤖

                </button>


              </div>

            );

          })}


        </div>


      </main>


    </div>

  );

}
