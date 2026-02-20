// src/app/api/search-jobs/route.ts
import { NextResponse } from "next/server";
import { chromium } from "playwright";
import * as cheerio from "cheerio";

/* ================= TYPES ================= */
interface Job {
  title: string;
  company: string;
  location: string;
  description: string;
  link: string;
  source: string;
  skills: string[];
  category?: string;
  postedAt?: string;
  match?: number;
  remote?: boolean;
}

/* ================= SKILL EXTRACTION ================= */
function extractSkills(text: string): string[] {
  const STOP = new Set([
    "the","and","for","with","from","that","this","have","has","had",
    "you","your","are","was","were","job","work","experience","years",
    "a","an","to","of","in","on","at","by","or"
  ]);
  const words = text.toLowerCase().replace(/[^a-z0-9+#. ]/g," ").split(/\s+/)
    .filter(w=>w.length>2 && w.length<25 && !STOP.has(w));
  return [...new Set(words)].slice(0,60);
}

/* ================= CATEGORY DETECTION ================= */
function detectCategory(text: string): string {
  const c = text.toLowerCase();
  if(/\b(software|developer|react|node|programmer|engineer|javascript|python)\b/.test(c)) return "ICT / Tech";
  if(/\b(accounting|finance|auditor|bank|cashier|tax)\b/.test(c)) return "Finance / Accounting";
  if(/\b(nurse|doctor|clinic|patient|healthcare|medical)\b/.test(c)) return "Healthcare";
  if(/\b(teacher|lecturer|school|education|tutor)\b/.test(c)) return "Education / Teaching";
  if(/\b(engineer|construction|civil|mechanical|electrician|builder)\b/.test(c)) return "Engineering / Construction";
  if(/\b(driver|delivery|operator|manual|labour|cleaner|security)\b/.test(c)) return "Manual / Trades / Driving";
  if(/\b(admin|hr|secretary|office|assistant)\b/.test(c)) return "Admin / Office";
  return "Other";
}

/* ================= MATCH ================= */
function matchScore(job: Job, userSkills: string[]): number {
  if(userSkills.length === 0) return 50;
  let score = 0;
  for(const skill of userSkills){
    if(job.skills.includes(skill)) score++;
  }
  return Math.round((score / userSkills.length) * 100);
}

/* ================= PLAYWRIGHT SCRAPER ================= */
async function scrapeZimbabweJobs(): Promise<Job[]> {
  const browser = await chromium.launch({ headless:true });
  const page = await browser.newPage();
  const jobs: Job[] = [];

  /* --- ZimJob --- */
  await page.goto("https://www.zimbajob.com/job-vacancies-search-zimbabwe",{timeout:60000});
  const zimLinks = await page.evaluate(()=>{
    const arr: any[] = [];
    document.querySelectorAll(".card-job").forEach(el=>{
      const a = el.querySelector(".card-title a");
      if(!a) return;
      arr.push({ title: a.textContent, link: a.href });
    });
    return arr;
  });
  for(const job of zimLinks.slice(0,15)){
    const detail = await browser.newPage();
    await detail.goto(job.link);
    const html = await detail.content();
    const $ = cheerio.load(html);
    const description = $(".content").text();
    const company = $(".company").text();
    const location = $(".location").text();
    jobs.push({
      title: job.title,
      company,
      location,
      description,
      link: job.link,
      source:"ZimJob",
      skills: extractSkills(job.title + description),
      category: detectCategory(job.title + " " + description),
      postedAt: new Date().toISOString()
    });
    await detail.close();
  }

  /* --- iHarare --- */
  await page.goto("https://ihararejobs.com/");
  const ihLinks = await page.evaluate(()=>{
    const arr: any[]=[];
    document.querySelectorAll("article h2 a").forEach(a=>{
      arr.push({ title: a.textContent, link: a.href });
    });
    return arr;
  });
  for(const job of ihLinks.slice(0,10)){
    const detail = await browser.newPage();
    await detail.goto(job.link);
    const html = await detail.content();
    const $ = cheerio.load(html);
    const description = $("article").text();
    jobs.push({
      title: job.title,
      company:"Zimbabwe Employer",
      location:"Zimbabwe",
      description,
      link:job.link,
      source:"iHarare",
      skills: extractSkills(job.title + description),
      category: detectCategory(job.title + " " + description)
    });
    await detail.close();
  }

  /* --- VacancyMail --- */
  await page.goto("https://vacancymail.co.zw/jobs/");
  const vmLinks = await page.evaluate(()=>{
    const arr: any[]=[];
    document.querySelectorAll(".entry-title a").forEach(a=>{
      arr.push({ title: a.textContent, link: a.href });
    });
    return arr;
  });
  for(const job of vmLinks.slice(0,10)){
    const detail = await browser.newPage();
    await detail.goto(job.link);
    const html = await detail.content();
    const $ = cheerio.load(html);
    const description = $(".entry-content").text();
    jobs.push({
      title:job.title,
      company:"Zimbabwe Employer",
      location:"Zimbabwe",
      description,
      link:job.link,
      source:"VacancyMail",
      skills:extractSkills(job.title+description),
      category: detectCategory(job.title + " " + description)
    });
    await detail.close();
  }

  await browser.close();
  return jobs;
}

/* ================= MAIN API ================= */
export async function POST(req: Request){
  try{
    const body = await req.json();
    const cvText: string = body.cvText || "";
    const keywords: string[] = body.keywords || [];
    const userSkills = [...extractSkills(cvText), ...keywords.map(k=>k.toLowerCase())];

    let jobs = await scrapeZimbabweJobs();

    jobs = jobs.map(job=>({
      ...job,
      match: matchScore(job,userSkills)
    }));

    // Sort by match %
    jobs.sort((a,b)=>(b.match||0)-(a.match||0));

    return NextResponse.json(jobs.slice(0,50));
  } catch(e){
    console.log(e);
    return NextResponse.json([]);
  }
}