"use client";

import { useEffect, useState } from "react";
import JobCard from "@/components/JobCard";

export default function FindJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const skills = JSON.parse(localStorage.getItem("skills") || "[]");

    async function search() {
      const res = await fetch("/api/search-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills }),
      });

      const data = await res.json();
      setJobs(data.jobs || []);
      setLoading(false);
    }

    search();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-gray-600">
        Searching the internet for jobs...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 p-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black mb-4">Find Jobs for You</h1>

        <p className="text-gray-600 mb-8">
          Found <b>{jobs.length}</b> jobs.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {jobs.map((job, i) => (
            <JobCard key={i} job={job} />
          ))}
        </div>
      </div>
    </div>
  );
}
