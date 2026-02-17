"use client";

import { useState } from "react";

export default function FindJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [cvText, setCvText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/find-jobs", {
        method: "POST",
        body: JSON.stringify({ cvText }),
      });
      const data = await res.json();
      setJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">QuickApply Job Search</h1>

      <textarea
        placeholder="Paste your CV text here..."
        value={cvText}
        onChange={(e) => setCvText(e.target.value)}
        className="w-full border p-3 rounded mb-4"
        rows={6}
      />

      <button
        onClick={handleSearch}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-6"
      >
        {loading ? "Searching..." : "Search Jobs"}
      </button>

      <div>
        {jobs.length === 0 && !loading && <p>No jobs found yet.</p>}

        {jobs.map((job, idx) => (
          <div
            key={idx}
            className="border p-3 rounded mb-3 hover:shadow"
          >
            <a
              href={job.link}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-blue-700"
            >
              {job.title}
            </a>
            <div className="text-sm text-gray-600">
              {job.company} - {job.location}
            </div>
            <div>Match: {job.match}%</div>
            <div className="text-xs text-gray-500">{job.source}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
