"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FiUpload,
  FiSearch,
  FiBriefcase,
  FiMapPin,
  FiX,
  FiPlus,
} from "react-icons/fi";

interface Job {
  title: string;
  company: string;
  description: string;
  location: string;
  link: string;
  source: string;
  match?: number;
}

export default function FindJobsPage() {

/* ================= STATE ================= */

const [jobs,setJobs]=useState<Job[]>([]);
const [loading,setLoading]=useState(false);
const [skills,setSkills]=useState<string[]>([]);
const [skillInput,setSkillInput]=useState("");
const [mounted,setMounted]=useState(false);
const [cvUploaded,setCvUploaded]=useState(false);


/* ================= LOAD ================= */

useEffect(()=>{

setMounted(true);

const savedSkills=localStorage.getItem("skills");
const savedCV=localStorage.getItem("cvText");

if(savedSkills) setSkills(JSON.parse(savedSkills));
if(savedCV) setCvUploaded(true);

},[]);


/* ================= FETCH JOBS ================= */

const fetchJobs = async(cvOverride?:string)=>{

setLoading(true);

const cvText=cvOverride || localStorage.getItem("cvText") || "";

try{

const res=await fetch("/api/search-jobs",{

method:"POST",
headers:{ "Content-Type":"application/json" },

body:JSON.stringify({

cvText,
keywords:skills

})

});

const data=await res.json();

setJobs(data);

}catch(err){

console.log(err);

}

setLoading(false);

};



/* ================= UPLOAD ================= */

const handleCVUpload=async(e:any)=>{

const file=e.target.files?.[0];

if(!file) return;

const text=await file.text();

localStorage.setItem("cvText",text);

setCvUploaded(true);

fetchJobs(text);

};



/* ================= SKILLS ================= */

const addSkill=()=>{

const s=skillInput.trim();

if(!s || skills.includes(s)) return;

const updated=[...skills,s];

setSkills(updated);

localStorage.setItem("skills",JSON.stringify(updated));

setSkillInput("");

};

const removeSkill=(s:string)=>{

const updated=skills.filter(k=>k!==s);

setSkills(updated);

localStorage.setItem("skills",JSON.stringify(updated));

};


/* ================= LOAD AUTO ================= */

useEffect(()=>{

if(mounted) fetchJobs();

},[mounted]);



if(!mounted) return null;



/* ================= UI ================= */

return(

<div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600">


{/* NAVBAR */}


<nav className="backdrop-blur-lg bg-white/20 border-b border-white/20 sticky top-0 z-50">


<div className="max-w-7xl mx-auto flex justify-between items-center p-4">


<h1 className="text-white font-bold text-2xl">

QuickApplyAI

</h1>


<div className="flex gap-6 text-white font-medium">

<Link href="/dashboard">Dashboard</Link>

<Link href="/upload-cv">Upload CV</Link>

</div>


</div>


</nav>



{/* HERO */}


<div className="text-center text-white mt-12">


<h1 className="text-5xl font-bold">

Find Your Dream Job

</h1>


<p className="mt-4 opacity-90">

AI powered job matching for ANY profession

</p>


</div>



{/* CV UPLOAD */}


<div className="max-w-xl mx-auto mt-10">


<label className="flex flex-col items-center justify-center bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl p-8 cursor-pointer hover:bg-white/30 transition">


<FiUpload size={40} className="text-white mb-3"/>


<p className="text-white font-semibold">

Upload Your CV

</p>


<input

type="file"

className="hidden"

onChange={handleCVUpload}

/>


</label>


{cvUploaded && (

<p className="text-green-300 mt-3 text-center">

CV uploaded successfully

</p>

)}


</div>



{/* SKILLS */}


<div className="max-w-xl mx-auto mt-8 bg-white/20 backdrop-blur-lg rounded-xl p-6">


<div className="flex gap-3">


<input

value={skillInput}

onChange={(e)=>setSkillInput(e.target.value)}

placeholder="Add skill"

className="flex-1 p-3 rounded-lg outline-none"

/>


<button

onClick={addSkill}

className="bg-white text-indigo-600 p-3 rounded-lg"

>

<FiPlus/>

</button>


</div>



<div className="flex flex-wrap gap-2 mt-4">


{skills.map(s=>(

<div

key={s}

className="bg-white text-indigo-600 px-4 py-1 rounded-full flex items-center gap-2"

>

{s}

<FiX

className="cursor-pointer"

onClick={()=>removeSkill(s)}

/>

</div>

))}


</div>


</div>



{/* SEARCH BUTTON */}


<div className="text-center mt-8">


<button

onClick={()=>fetchJobs()}

className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-bold hover:scale-105 transition"

>

Search Jobs

</button>


</div>



{/* RESULTS */}


<div className="max-w-7xl mx-auto mt-12 pb-20">


{loading && (

<div className="text-center text-white text-xl">

Searching jobs...

</div>

)}



<div className="grid md:grid-cols-3 gap-6">


{jobs.map((job,i)=>(


<div

key={i}

className="bg-white rounded-xl p-6 hover:scale-105 transition shadow-xl"

>


<h2 className="font-bold text-lg">

{job.title}

</h2>


<p className="text-gray-600">

{job.company}

</p>


<div className="flex items-center gap-2 text-gray-500 text-sm mt-1">

<FiMapPin/>

{job.location}

</div>



{/* MATCH BAR */}


<div className="mt-4">


<div className="text-sm">

Match {job.match}%

</div>


<div className="w-full bg-gray-200 h-2 rounded-full mt-1">


<div

className="bg-green-500 h-2 rounded-full"

style={{width:`${job.match}%`}}

>


</div>


</div>


</div>



<button

onClick={()=>window.open(job.link)}

className="mt-5 w-full bg-indigo-600 text-white py-2 rounded-lg"

>

Apply Now

</button>


</div>


))}


</div>


</div>


</div>


);

}
