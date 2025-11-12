import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "User not found, please sign up" }, { status: 404 });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password || "");
    if (!isPasswordCorrect) {
      return NextResponse.json({ message: "Incorrect password" }, { status: 401 });
    }

    return NextResponse.json({ message: `Welcome back, ${user.name || "User"}` });
  } catch (error) {
    console.error("Signin Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
