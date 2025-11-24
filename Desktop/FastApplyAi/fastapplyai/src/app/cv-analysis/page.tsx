"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiArrowLeft, FiUserCheck } from "react-icons/fi";
import { useRouter } from "next/navigation";

export default function CVAnalysisPage() {
  const [cv, setCv] = useState<any | null>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("cvData");

    if (!stored) {
      window.location.href = "/upload-cv";
      return;
    }

    const parsed = JSON.parse(stored);
    const text = parsed.text || "";

    setCv({
      fullName: extractName(text),
      email: extractEmail(text),
      experience: extractExperience(text),
      education: extractEducation(text),
      skills: extractSkills(text),
      rawText: text
    });
  }, []);

  if (!cv) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-700 text-xl animate-pulse">
        Loading CV analysis...
      </div>
    );
  }

  async function handleFindJobs() {
    localStorage.setItem("skills", JSON.stringify(cv.skills));
    router.push("/find-jobs"); // 🔥 Move to jobs page
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-10 font-sans">
      <div className="max-w-5xl mx-auto bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-10 border border-white/40 animate-fadeIn">

        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-green-100 rounded-2xl shadow-sm">
            <FiUserCheck className="text-green-700 text-3xl" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            CV Analysis Complete
          </h1>
        </div>

        <p className="text-gray-600 mb-12 text-lg">
          We analyzed your CV and extracted the most relevant information.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <Section title="Full Name" content={cv.fullName} />
            <Section title="Email Address" content={cv.email} />
            <Section title="Experience Summary" content={cv.experience} multiline />
            <Section title="Education" content={cv.education} multiline />
          </div>

          <div>
            <h2 className="font-semibold text-gray-700 mb-3 text-xl">
              Extracted Skills ({cv.skills.length})
            </h2>

            <div className="bg-gray-50 p-5 rounded-2xl shadow-inner border border-gray-200 flex flex-wrap gap-3">
              {cv.skills.map((skill: string, index: number) => (
                <span
                  key={index}
                  className="bg-gradient-to-br from-green-200 to-green-300 text-green-900 px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm hover:scale-105 transition-transform"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-14">
          <button
            onClick={handleFindJobs}
            className="bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-2xl text-lg font-bold shadow-xl transition-transform hover:scale-105"
          >
            ✓ Save Profile & Find Jobs
          </button>
        </div>

        <Link
          href="/upload-cv"
          className="flex items-center gap-2 text-gray-600 mt-10 font-medium hover:text-gray-900 transition-colors"
        >
          <FiArrowLeft /> Upload another CV
        </Link>
      </div>
    </div>
  );
}

function Section({ title, content, multiline = false }: any) {
  return (
    <div>
      <h2 className="font-semibold text-gray-700 mb-2 text-xl">{title}</h2>
      <p
        className={`bg-gray-50 p-4 rounded-2xl border border-gray-200 shadow-inner text-gray-800 ${
          multiline ? "whitespace-pre-line leading-relaxed" : ""
        }`}
      >
        {content}
      </p>
    </div>
  );
}

/* --- Extraction Helpers --- */
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
    "HTML","CSS","JavaScript","React","Node.js","Next.js",
    "Python","Django","PHP","Laravel","SQL","WordPress",
    "Java","C++","UI/UX","Cybersecurity","DevOps",
    "AWS","Docker","Tailwind"
  ];
  const lower = text.toLowerCase();
  return skillsList.filter((skill) => lower.includes(skill.toLowerCase()));
}
function extractExperience(text: string) {
  const lines = text.split("\n").filter((line) =>
    ["experience","developer","intern","worked","projects"]
      .some((keyword) => line.toLowerCase().includes(keyword))
  );
  return lines.slice(0, 5).join("\n") || "Experience not found";
}
function extractEducation(text: string) {
  const lines = text.split("\n").filter((line) =>
    ["degree","certificate","college","university","education"]
      .some((keyword) => line.toLowerCase().includes(keyword))
  );
  return lines.slice(0, 5).join("\n") || "Education not found";
}
