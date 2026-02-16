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

  const user = {
    fullName: "Wayne Benhura",
    email: "wayne@email.com",
    phone: "+263771000000",
    resumeUrl: "/resume.pdf",
  };

  useEffect(() => {
    setMounted(true);

    const storedSkills = localStorage.getItem("skills");
    const applied = localStorage.getItem("appliedJobs");

    if (storedSkills) setSkills(JSON.parse(storedSkills));
    if (applied) setAppliedJobs(JSON.parse(applied));
  }, []);

  // ✅ BEST HTML CLEANER (Production Level)
  const cleanJobDescription = (html?: string) => {
    if (!html) return "";

    try {
      const doc = new DOMParser().parseFromString(html, "text/html");

      let text = doc.body.textContent || "";

      text = text
        .replace(/\s+/g, " ")
        .replace(/&nbsp;/g, " ")
        .trim();

      return text;

    } catch {
      return html.replace(/<[^>]+>/g, " ");
    }
  };


  // ✅ Better trimming (doesn't cut words)
  const trimDescription = (text: string, length = 180) => {

    if (text.length <= length) return text;

    const trimmed = text.substring(0, length);

    return trimmed.substring(0, trimmed.lastIndexOf(" ")) + "...";
  };


  const fetchJobs = async () => {

    setLoading(true);

    try {

      const res = await fetch("/api/search-jobs", {

        method: "POST",

        headers: {

          "Content-Type": "application/json",

        },

        body: JSON.stringify({

          country,

          city,

          keywords: skills,

          minMatch,

        }),

      });

      const data = await res.json();

      setJobs(data);

    } catch {

      setJobs([]);

    }

    setLoading(false);

  };


  useEffect(() => {

    if (mounted) fetchJobs();

  }, [mounted]);


  const applyJob = (job: Job) => {

    window.open(job.link, "_blank");

    if (!appliedJobs.includes(job.link)) {

      const updated = [...appliedJobs, job.link];

      setAppliedJobs(updated);

      localStorage.setItem("appliedJobs", JSON.stringify(updated));

    }

  };


  const formatAge = (iso?: string) => {

    if (!iso) return "";

    const diff = Date.now() - new Date(iso).getTime();

    const hours = diff / (1000 * 60 * 60);

    if (hours < 24) return Math.round(hours) + "h ago";

    return Math.round(hours / 24) + "d ago";

  };


  if (!mounted) return null;


  return (

    <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-sky-100 to-emerald-200">

      <main className="px-6 pb-24">


        {loading && (

          <p className="text-center text-lg animate-pulse">

            Loading jobs...

          </p>

        )}


        {!loading && jobs.length === 0 && (

          <p className="text-center">

            No jobs found

          </p>

        )}


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">


          {jobs.map((job, index) => {


            const clean = cleanJobDescription(job.description);

            const trimmed = trimDescription(clean);


            return (

              <div key={index}

              className="bg-white p-6 rounded-2xl shadow-xl">


                <a href={job.link}

                target="_blank">

                  <h2 className="text-xl font-bold hover:text-green-600">

                    {job.title}

                  </h2>

                </a>


                <p className="text-gray-600">

                  {job.company}

                </p>


                <p className="text-gray-500 text-sm">

                  {job.location}

                </p>


                {/* ✅ CLEAN DESCRIPTION */}
                <p className="mt-3 text-gray-700">

                  {trimmed}

                </p>


                <p className="text-xs text-gray-400 mt-2">

                  Source: {job.source}

                </p>


                {job.postedAt && (

                  <p className="text-xs text-gray-400">

                    {formatAge(job.postedAt)}

                  </p>

                )}


                {/* Skills */}
                {job.skills && (

                  <div className="flex flex-wrap gap-2 mt-3">

                    {job.skills.map(skill => (

                      <span key={skill}

                      className="bg-blue-100 px-2 py-1 text-xs rounded">

                        {skill}

                      </span>

                    ))}

                  </div>

                )}


                {/* Match */}
                {job.match && (

                  <p className="mt-2 font-semibold text-green-600">

                    {job.match}% Match

                  </p>

                )}


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
