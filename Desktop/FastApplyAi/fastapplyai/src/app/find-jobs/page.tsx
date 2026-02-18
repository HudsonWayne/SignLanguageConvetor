"use client";

import { useState, useEffect } from "react";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  match: number;
  applyUrl: string;
}

export default function Page() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [cvText, setCvText] = useState("");
  const [loading, setLoading] = useState(false);

  /* LOAD SKILLS */
  useEffect(() => {
    const saved = localStorage.getItem("skills");

    if (saved) setSkills(JSON.parse(saved));
  }, []);

  /* SAVE SKILLS */
  useEffect(() => {
    localStorage.setItem("skills", JSON.stringify(skills));
  }, [skills]);

  /* ADD SKILL */
  function addSkill() {
    if (!input) return;

    if (!skills.includes(input)) {
      setSkills([...skills, input]);
    }

    setInput("");
  }

  /* REMOVE SKILL */
  function removeSkill(skill: string) {
    setSkills(skills.filter((s) => s !== skill));
  }

  /* UPLOAD CV */
  async function uploadCV(e: any) {
    const file = e.target.files[0];

    if (!file) return;

    const text = await file.text();

    setCvText(text);

    localStorage.setItem("cvText", text);
  }

  /* SEARCH JOBS */
  async function searchJobs() {
    setLoading(true);

    const res = await fetch("/api/search-jobs", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        cvText,
        skills,
        user: {
          name: "User",
          email: "user@email.com",
        },
      }),
    });

    const data = await res.json();

    setJobs(data.jobs || []);

    setLoading(false);
  }

  /* APPLY */
  async function apply(job: Job) {
    const res = await fetch("/api/apply-job", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        job,
        user: {
          name: "User",
          email: "user@email.com",
        },
      }),
    });

    const data = await res.json();

    if (data.redirect) {
      window.open(data.redirect);
    }
  }

  return (
    <div className="p-10">

      <h1 className="text-4xl font-bold mb-5">

        Find Jobs

      </h1>

      {/* CV */}

      <input type="file" onChange={uploadCV} />

      {/* SKILLS */}

      <div className="mt-5">

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add skill"
          className="border p-2"
        />

        <button
          onClick={addSkill}
          className="bg-green-500 text-white px-4 py-2 ml-2"
        >
          Add
        </button>

      </div>

      {/* SKILLS LIST */}

      <div className="mt-3">

        {skills.map((skill) => (

          <span
            key={skill}
            className="bg-blue-500 text-white px-3 py-1 mr-2 cursor-pointer"
            onClick={() => removeSkill(skill)}
          >

            {skill}

          </span>

        ))}

      </div>

      {/* SEARCH */}

      <button
        onClick={searchJobs}
        className="bg-purple-600 text-white px-6 py-3 mt-5"
      >

        Search Jobs

      </button>

      {/* LOADING */}

      {loading && <p>Loading jobs...</p>}

      {/* JOBS */}

      <div className="mt-10">

        {jobs.map((job) => (

          <div
            key={job.id}
            className="border p-5 mb-5"
          >

            <h2 className="text-xl font-bold">

              {job.title}

            </h2>

            <p>

              {job.location}

            </p>

            <p>

              Match: {job.match}%

            </p>

            <button
              onClick={() => apply(job)}
              className="bg-green-600 text-white px-5 py-2 mt-3"
            >

              Apply

            </button>

          </div>

        ))}

      </div>

    </div>
  );
}
