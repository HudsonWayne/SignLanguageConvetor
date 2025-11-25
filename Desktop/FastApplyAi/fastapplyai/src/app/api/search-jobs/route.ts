import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { skills } = await req.json();

    if (!skills || skills.length === 0) {
      return NextResponse.json({ jobs: [] });
    }

    const query = skills.slice(0, 5).join(" "); // top 5 skills ⇢ search query

    const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(
      query
    )}&page=1&num_pages=1`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY as string, // <-- PLACE IN .env
        "x-rapidapi-host": "jsearch.p.rapidapi.com",
      },
    });

    const data = await response.json();

    const jobs = (data.data || []).map((job: any, i: number) => ({
      id: i + 1,
      title: job.job_title,
      company: job.employer_name,
      location: job.job_city || job.job_country,
      description: job.job_description?.slice(0, 200) + "...",
      url: job.job_apply_link,
    }));

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("Job search error:", error);
    return NextResponse.json({ jobs: [] });
  }
}
