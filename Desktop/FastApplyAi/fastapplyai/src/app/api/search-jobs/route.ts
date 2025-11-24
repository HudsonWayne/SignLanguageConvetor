import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { skills } = await req.json();

  const query = skills.slice(0, 5).join(" ");

  const url = `https://jsearch.p.rapidapi.com/search?query=${query}&num_pages=1`;

  const res = await fetch(url, {
    headers: {
      "x-rapidapi-key": "https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch",
      "x-rapidapi-host": "jsearch.p.rapidapi.com"
    }
  });

  const data = await res.json();

  return NextResponse.json(data.data || []);
}
