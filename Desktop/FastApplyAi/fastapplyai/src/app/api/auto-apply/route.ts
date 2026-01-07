import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { job, user } = await req.json();

  if (!job || !user) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  // 1️⃣ Email-based auto apply
  if (job.applyType === "email") {
    // send email with CV attached
    // nodemailer / resend / sendgrid
    return NextResponse.json({
      success: true,
      method: "email",
      message: "Applied via email",
    });
  }

  // 2️⃣ External apply (open link)
  if (job.applyType === "external") {
    return NextResponse.json({
      success: true,
      method: "external",
      redirect: job.link,
    });
  }

  // 3️⃣ Manual fallback
  return NextResponse.json({
    success: false,
    method: "manual",
    message: "Manual application required",
  });
}
