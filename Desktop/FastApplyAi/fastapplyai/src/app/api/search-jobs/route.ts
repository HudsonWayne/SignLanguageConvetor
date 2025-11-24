import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { skills } = await req.json();

    // No skills? Return empty array
    if (!skills || skills.length === 0) {
      return NextResponse.json({ jobs: [] });
    }

    // Create a search query string
    const query = skills.slice(0, 6).join(" ");

    const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(
      query
    )}&num_pages=1`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": process.env.RAPID_API_KEY!, // MUST be a real key
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
      },
    });

    if (!res.ok) {
      console.error("JSearch Error:", await res.text());
      return NextResponse.json({ jobs: [] });
    }

    const data = await res.json();

    // Always return an array to avoid "jobs.map is not a function"
    return NextResponse.json({
      jobs: Array.isArray(data.data) ? data.data : [],
    });
  } catch (error) {
    console.error("Job API Error:", error);
    return NextResponse.json(
      { jobs: [] },
      { status: 500 }
    );
  }
}
