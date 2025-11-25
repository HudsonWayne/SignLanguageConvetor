"use client";

import { useEffect, useState } from "react";

export default function FindJobsPage() {
  const [skills, setSkills] = useState<string[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [country, setCountry] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const storedSkills = localStorage.getItem("skills");
    if (storedSkills) {
      setSkills(JSON.parse(storedSkills));
    }
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
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      <h1 className="text-3xl font-bold mb-4">Job Matches</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <input
          type="text"
          placeholder="Filter by country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="p-2 border rounded"
        />
        <input
          type="number"
          placeholder="Minimum salary"
          value={minSalary}
          onChange={(e) => setMinSalary(e.target.value)}
          className="p-2 border rounded"
        />
        <button
          onClick={() => setPage(1)}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Apply Filters
        </button>
      </div>

      {loading ? (
        <p>Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <p>No jobs found for your skills yet.</p>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="p-4 bg-white rounded shadow hover:shadow-md transition"
            >
              <a href={job.url} target="_blank" rel="noopener noreferrer">
                <h2 className="font-bold text-lg">{job.title}</h2>
              </a>
              <p className="text-gray-600">{job.company}</p>
              <p className="text-gray-500">{job.location}</p>
              <p className="text-gray-700">{job.description}</p>
              <p className="text-green-600 font-semibold">
                Match: {job.matchPercent}%
              </p>
              <p className="text-gray-500">Salary: {job.salary}</p>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex gap-2 justify-center mt-6">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Prev
        </button>
        <span className="px-4 py-2">{page}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}
