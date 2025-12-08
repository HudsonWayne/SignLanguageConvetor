// src/app/api/apply-job/route.ts
import { NextResponse } from "next/server";

/**
 * Prepares a semi-automatic job application
 * Opens the job's apply page and stores applicant info for reference
 */
export async function POST(req: Request) {
  const body = await req.json();
  const { jobLink, applicant } = body;

  if (!jobLink || !applicant) {
    return NextResponse.json({ success: false, message: "Job link or applicant info missing" }, { status: 400 });
  }

  // In production, you could store this info in a DB for tracking
  console.log("Prepared application:", { jobLink, applicant });

  return NextResponse.json({
    success: true,
    message: `Application prepared for ${jobLink}`,
    jobLink,
    applicant,
  });
}
