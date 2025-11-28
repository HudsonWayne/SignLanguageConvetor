import { NextResponse } from "next/server";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const REDIRECT_URI = "http://localhost:3000/api/auth/google/callback";

export async function GET() {
  const googleURL =
    "https://accounts.google.com/o/oauth2/v2/auth?" +
    new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: "code",
      scope: "email profile",
      prompt: "select_account",
    }).toString();

  return NextResponse.redirect(googleURL);
}

