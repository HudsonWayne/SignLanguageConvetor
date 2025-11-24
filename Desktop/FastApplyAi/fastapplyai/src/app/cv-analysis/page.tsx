"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiArrowLeft, FiUserCheck } from "react-icons/fi";

export default function CVAnalysisPage() {
  const [cv, setCv] = useState<any | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("cvData");

    if (!stored) {
      window.location.href = "/upload-cv";
      return;
    }

    const parsed = JSON.parse(stored);

    // Your backend returns { text: "extracted pdf text" }
    // Here we process that text into data fields
    const text = parsed.text || "";

    setCv({
      fullName: extractName(text),
      email: extractEmail(text),
      experience: extractExperience(text),
      education: extractEducation(text),
      skills: extractSkills(text),
    });
  }, []);

  if (!cv) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-700">
        Loading CV analysis...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e8f3ff] p-10 text-gray-900 font-sans">
      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-3xl p-10 border border-gray-200">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <FiUserCheck className="text-green-600 text-4xl" />
          <h1 className="text-3xl font-bold">CV Analysis Complete</h1>
        </div>

        <p className="text-gray-600 mb-10">
          Review the extracted information below
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* Left Column */}
          <div>
            <h2 className="font-semibold text-gray-700 mb-2">Full Name</h2>
            <p className="bg-gray-100 p-3 rounded-xl">{cv.fullName}</p>

            <h2 className="font-semibold text-gray-700 mt-6 mb-2">Email Address</h2>
            <p className="bg-gray-100 p-3 rounded-xl">{cv.email}</p>

            <h2 className="font-semibold text-gray-700 mt-6 mb-2">Experience Summary</h2>
            <p className="bg-gray-100 p-3 rounded-xl whitespace-pre-line">
              {cv.experience}
            </p>

            <h2 className="font-semibold text-gray-700 mt-6 mb-2">Education</h2>
            <p className="bg-gray-100 p-3 rounded-xl whitespace-pre-line">
              {cv.education}
            </p>
          </div>

          {/* Right Column – Skills */}
          <div>
            <h2 className="font-semibold text-gray-700 mb-2">
              Extracted Skills ({cv.skills.length})
            </h2>

            <div className="bg-gray-100 p-4 rounded-xl flex flex-wrap gap-2">
              {cv.skills.map((skill: string, index: number) => (
                <span
                  key={index}
                  className="bg-green-200 text-green-900 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Save & Apply Button */}
        <div className="flex justify-center mt-10">
          <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold shadow-md">
            ✓ Save Profile & Find Jobs
          </button>
        </div>

        <Link
          href="/upload-cv"
          className="flex items-center gap-2 text-gray-600 mt-8"
        >
          <FiArrowLeft /> Upload a different CV
        </Link>
      </div>
    </div>
  );
}

/* ---- SIMPLE TEXT EXTRACTION HELPERS ---- */

function extractName(text: string) {
  const match = text.match(/[A-Z][A-Z\s]{4,40}/);
  return match ? match[0].trim() : "Name not found";
}

function extractEmail(text: string) {
  const match = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  return match ? match[0] : "Email not found";
}

function extractSkills(text: string) {
  const skillsList = [
    "HTML",
    "CSS",
    "JavaScript",
    "React",
    "Node.js",
    "Next.js",
    "Python",
    "Django",
    "PHP",
    "Laravel",
    "SQL",
    "WordPress",
    "Java",
    "C++",
    "UI/UX",
    "Cybersecurity",
    "Data Structures",
    "Algorithms",
    "Digital Marketing",
    "DevOps",
    "AWS",
    "Docker",
    "Tailwind",
  ];

  const cleanText = text.toLowerCase();

  return skillsList.filter((skill) =>
    cleanText.includes(skill.toLowerCase())
  );
}

function extractExperience(text: string) {
  const sentences = text.split("\n").filter((line) =>
    line.toLowerCase().includes("experience") ||
    line.toLowerCase().includes("developer") ||
    line.toLowerCase().includes("intern") ||
    line.toLowerCase().includes("worked") ||
    line.toLowerCase().includes("collaborated") ||
    line.toLowerCase().includes("projects")
  );

  return sentences.slice(0, 5).join("\n") || "Experience not found";
}

function extractEducation(text: string) {
  const sentences = text.split("\n").filter((line) =>
    line.toLowerCase().includes("certificate") ||
    line.toLowerCase().includes("degree") ||
    line.toLowerCase().includes("college") ||
    line.toLowerCase().includes("university") ||
    line.toLowerCase().includes("education") ||
    line.toLowerCase().includes("o'levels")
  );

  return sentences.slice(0, 5).join("\n") || "Education not found";
}
