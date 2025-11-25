import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { skills, country, minSalary, page } = await req.json();

    if (!skills || skills.length === 0) {
      return NextResponse.json({ jobs: [] });
    }

    const query = skills.slice(0, 5).join(" "); // top 5 skills

    const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(
      query
    )}&page=${page || 1}&num_pages=1`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY as string,
        "x-rapidapi-host": "jsearch.p.rapidapi.com",
      },
    });

    const data = await response.json();

    const jobs = (data.data || [])
      .filter((job: any) => {
        // Filter by country
        if (country) {
          return (
            (job.job_country || "").toLowerCase().includes(country.toLowerCase())
          );
        }
        return true;
      })
      .filter((job: any) => {
        // Filter by min salary (if available)
        if (minSalary && job.salary) {
          const salaryStr = job.salary.replace(/[^0-9]/g, "");
          return Number(salaryStr) >= Number(minSalary);
        }
        return true;
      })
      .map((job: any, i: number) => {
        // AI scoring based on matching skills
        const lowerDesc = (job.job_description || "").toLowerCase();
        const matchCount = skills.reduce(
          (count: number, skill: string) =>
            lowerDesc.includes(skill.toLowerCase()) ? count + 1 : count,
          0
        );
        const matchPercent = Math.round((matchCount / skills.length) * 100);

        return {
          id: i + 1,
          title: job.job_title,
          company: job.employer_name,
          location: job.job_city || job.job_country,
          description: job.job_description?.slice(0, 300) + "...",
          url: job.job_apply_link,
          salary: job.salary || "Not provided",
          matchPercent,
        };
      });

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("Job search error:", error);
    return NextResponse.json({ jobs: [] });
  }
}
