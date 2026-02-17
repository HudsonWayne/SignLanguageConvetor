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

}



export default function FindJobsPage() {


/* ================= STATES ================= */


const [jobs,setJobs]=useState<Job[]>([]);

const [loading,setLoading]=useState(false);

const [skills,setSkills]=useState<string[]>([]);

const [skillInput,setSkillInput]=useState("");

const [mobileMenu,setMobileMenu]=useState(false);

const [mounted,setMounted]=useState(false);

const [cvUploaded,setCvUploaded]=useState(false);



/* ================= LOAD SAVED DATA ================= */


useEffect(()=>{

setMounted(true);

const savedSkills=

localStorage.getItem("skills");

const savedCV=

localStorage.getItem("cvText");

if(savedSkills){

setSkills(

JSON.parse(savedSkills)

);

}

if(savedCV){

setCvUploaded(true);

}

},[]);



/* ================= FETCH JOBS ================= */


const fetchJobs = async(

cvOverride?:string

)=>{


setLoading(true);


const cvText=

cvOverride ||

localStorage.getItem("cvText") ||

"";


try{


const res=

await fetch(

"/api/search-jobs",

{

method:"POST",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify({

cvText,

keywords:skills

})

}

);


const data=

await res.json();


setJobs(data);


}catch(err){

console.log(err);

}


setLoading(false);


};




/* ================= CV UPLOAD ================= */


const handleCVUpload=async(

e:React.ChangeEvent<HTMLInputElement>

)=>{


e.preventDefault();


const file=

e.target.files?.[0];


if(!file) return;


const text=

await file.text();


localStorage.setItem(

"cvText",

text

);


setCvUploaded(true);


fetchJobs(text);


};




/* ================= ADD SKILL ================= */


const addSkill=()=>{


const s=

skillInput.trim();


if(

!s ||

skills.includes(s)

) return;


const updated=

[...skills,s];


setSkills(updated);


localStorage.setItem(

"skills",

JSON.stringify(updated)

);


setSkillInput("");


};




/* ================= REMOVE SKILL ================= */


const removeSkill=(s:string)=>{


const updated=

skills.filter(

k=>k!==s

);


setSkills(updated);


localStorage.setItem(

"skills",

JSON.stringify(updated)

);


};



/* ================= AUTO LOAD JOBS ================= */


useEffect(()=>{


if(mounted)

fetchJobs();


},[mounted]);



/* ================= UI ================= */


if(!mounted)

return null;



return(


<div className="min-h-screen bg-gradient-to-br from-indigo-200 via-sky-100 to-emerald-200">



{/* NAV */}



<nav className="bg-white p-4 flex justify-between">


<div className="font-bold text-xl">


QuickApplyAI


</div>


<div className="flex gap-4">


<Link href="/dashboard">

Dashboard

</Link>


<Link href="/upload-cv">

Upload CV

</Link>


</div>


</nav>




{/* HEADER */}


<div className="text-center mt-10">


<h1 className="text-4xl font-bold">


Find Matching Jobs


</h1>


<p className="text-gray-600 mt-2">


Works for ANY CV profession


</p>


</div>




{/* CV UPLOAD */}


<div className="max-w-xl mx-auto mt-8 bg-white p-6 rounded shadow">


<label className="font-semibold">


Upload your CV


</label>


<input

type="file"

accept=".txt,.pdf,.doc,.docx"

onChange={handleCVUpload}

className="mt-2"

/>


{cvUploaded && (


<p className="text-green-600 mt-2">


CV uploaded successfully ✅


</p>


)}


</div>




{/* SKILLS */}



<div className="max-w-xl mx-auto mt-6 bg-white p-6 rounded shadow">


<div className="flex gap-2">


<input

value={skillInput}

onChange={(e)=>

setSkillInput(e.target.value)

}

placeholder="Add skill"

className="border p-2 flex-1"

/>


<button

onClick={addSkill}

className="bg-blue-600 text-white px-4"


>


Add


</button>


</div>




<div className="flex gap-2 flex-wrap mt-4">


{skills.map((s)=>(


<div

key={s}

className="bg-green-200 px-3 py-1 rounded"

>


{s}


<button

onClick={()=>

removeSkill(s)

}

className="ml-2 text-red-500"

>


✕


</button>


</div>


))}


</div>


</div>




{/* SEARCH BUTTON */}



<div className="text-center mt-6">


<button

onClick={()=>fetchJobs()}

className="bg-green-600 text-white px-6 py-3 rounded font-bold"

>


Search Jobs


</button>


</div>




{/* RESULTS */}



<div className="max-w-5xl mx-auto mt-10">


{loading &&


<p>


Loading jobs...


</p>


}




{!loading && jobs.length===0 &&


<p>


No jobs found.


</p>


}




<div className="grid md:grid-cols-2 gap-6">


{jobs.map((job,i)=>(


<div

key={i}

className="bg-white p-5 rounded shadow"

>


<a

href={job.link}

target="_blank"

className="font-bold text-lg text-blue-600"

>


{job.title}


</a>


<p>


{job.company}


</p>


<p className="text-sm text-gray-500">


{job.location}


</p>


<p className="text-sm mt-2">


Match:


{job.match}%


</p>


<button

onClick={()=>window.open(job.link)}

className="bg-green-600 text-white px-4 py-2 mt-3 rounded"

>


Apply


</button>


</div>


))}


</div>


</div>



</div>


);


}
