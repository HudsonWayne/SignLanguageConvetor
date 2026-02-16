import { NextResponse } from "next/server";

export async function POST(req: Request) {

  try {

    const body = await req.json();

    const keywords: string[] = body.keywords || [];

    const minMatch: number = body.minMatch || 0;



    // ✅ Fetch real jobs from Remotive

    const res = await fetch(

      "https://remotive.com/api/remote-jobs"

    );



    const data = await res.json();



    const jobs = data.jobs || [];



    // ✅ Process jobs

    const processed = jobs.map((job: any) => {

      const description = job.description || "";



      const text = (

        job.title +

        " " +

        description +

        " " +

        job.category

      ).toLowerCase();



      // Match %

      let match = 0;



      if (keywords.length > 0) {

        const matches = keywords.filter(skill =>

          text.includes(skill.toLowerCase())

        );



        match = Math.round(

          (matches.length / keywords.length) * 100

        );

      }



      return {

        title: job.title,

        company: job.company_name,

        description: description,

        location: job.candidate_required_location,

        link: job.url,

        source: "Remotive",

        match: match,

        remote: true,

        postedAt: job.publication_date,

        skills: job.tags,

        matchedSkills: keywords.filter(skill =>

          text.includes(skill.toLowerCase())

        ),

      };

    });



    // Filter

    const filtered = processed.filter(

      (job: any) => job.match >= minMatch

    );



    return NextResponse.json(filtered);



  } catch (error) {

    console.log(error);

    return NextResponse.json([]);

  }

}
