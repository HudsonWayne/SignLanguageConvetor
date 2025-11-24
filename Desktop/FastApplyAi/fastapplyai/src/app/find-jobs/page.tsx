"use client";

import { useEffect, useState } from "react";
import JobCard from "@/components/JobCard";

export default function FindJobsPage() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const skills = JSON.parse(localStorage.getItem("skills") || "[]");

    fetch("/api/search-jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skills }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("API Response:", data);
        setJobs(data.jobs || []); // ← FIXED
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="p-10 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold mb-10">Jobs Based on Your Skills</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {jobs.length === 0 ? (
          <p>No jobs found...</p>
        ) : (
          jobs.map((job: any, index: number) => (
            <JobCard key={index} job={job} />
          ))
        )}
      </div>
    </div>
  );
}
