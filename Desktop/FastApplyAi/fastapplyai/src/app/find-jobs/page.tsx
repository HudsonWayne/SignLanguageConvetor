"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FiMapPin,
  FiExternalLink,
  FiCheckCircle,
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
}

export default function FindJobsPage() {

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<"all" | "local" | "remote">("all");



  // CLEAN HTML
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



  // TRIM TEXT
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




  const fetchJobs = async () => {

    setLoading(true);

    try {

      const res = await fetch("/api/search-jobs", {

        method: "POST",

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

    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">



      {/* HEADER */}

      <header className="text-center pt-16 pb-10">

        <h1 className="text-5xl font-extrabold text-gray-900">

          Find Matching Jobs

        </h1>

        <p className="text-gray-500 mt-3">

          Jobs matched to your CV skills

        </p>

      </header>



      {/* JOB GRID */}

      <main className="max-w-7xl mx-auto px-6 pb-20">


        {loading && (

          <div className="text-center py-20">

            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mx-auto mb-6"/>

            <p className="text-gray-500 text-lg">

              Finding best jobs for you...

            </p>

          </div>

        )}




        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">


          {filteredJobs.map((job, index) => {


            const clean = cleanJobDescription(job.description);

            const trimmed = trimDescription(clean);

            const matchedSkills = matchedSkillsForJob(job);

            const applied = appliedJobs.includes(job.link);


            return (

              <div key={index}


              className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition duration-300 border border-gray-100 p-6 flex flex-col justify-between">


                {/* TOP */}

                <div>


                  <a href={job.link} target="_blank">

                    <h2 className="text-xl font-bold text-gray-900 hover:text-green-600 transition">

                      {job.title}

                    </h2>

                  </a>


                  <p className="text-gray-600 font-medium mt-1">

                    {job.company}

                  </p>



                  <div className="flex items-center text-gray-400 text-sm mt-1 gap-1">

                    <FiMapPin/>

                    {job.location}

                  </div>



                  <p className="text-gray-600 mt-4 text-sm leading-relaxed">

                    {trimmed}

                  </p>



                </div>



                {/* BOTTOM */}

                <div className="mt-6">


                  {/* MATCH */}

                  <div className="flex items-center justify-between mb-3">

                    <span className="text-sm font-semibold text-green-600">

                      {job.match || 0}% Match

                    </span>


                    {job.postedAt && (

                      <span className="text-xs text-gray-400">

                        {formatAge(job.postedAt)}

                      </span>

                    )}

                  </div>



                  {/* MATCHED SKILLS */}

                  <div className="flex flex-wrap gap-2 mb-4">

                    {matchedSkills.map(skill => (

                      <span key={skill}

                      className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">

                        {skill}

                      </span>

                    ))}

                  </div>



                  {/* APPLY BUTTON */}

                  <button

                    onClick={() => applyJob(job)}

                    className={`w-full py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2


                    ${applied

                    ? "bg-gray-200 text-gray-500"

                    : "bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg"

                    }`}


                  >

                    {applied

                    ? <>

                        <FiCheckCircle/>

                        Applied

                      </>

                    : <>

                        Apply Now

                        <FiExternalLink/>

                      </>

                    }

                  </button>



                </div>


              </div>

            );

          })}


        </div>


      </main>


    </div>

  );

}
