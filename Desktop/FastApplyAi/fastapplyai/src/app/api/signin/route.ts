// /pages/api/signin.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongodb"; // correct file name
import User from "@/models/user";
import bcrypt from "bcryptjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Connect to MongoDB
  await connectDB();

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found, please sign up" });
    }

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(password, user.password || "");

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // Successfully authenticated
    return res.status(200).json({ message: `Welcome back, ${user.name || "User"}` });
  } catch (error) {
    console.error("Signin Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
