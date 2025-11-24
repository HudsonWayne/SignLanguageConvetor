import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { skills } = await req.json();

    if (!skills || skills.length === 0) {
      return NextResponse.json({ jobs: [] });
    }

    const query = skills.slice(0, 6).join(" ");
    const url = `https://jsearch.p.rapidapi.com/search?query=${query}&num_pages=1`;

    const res = await fetch(url, {
      headers: {
        "x-rapidapi-key": process.env.RAPID_API_KEY!, // ✅ correct key
        "x-rapidapi-host": "jsearch.p.rapidapi.com"
      }
    });

    const data = await res.json();

    return NextResponse.json({ jobs: data.data || [] }); // ✅ correct return
  } catch (error) {
    console.error("Job API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
