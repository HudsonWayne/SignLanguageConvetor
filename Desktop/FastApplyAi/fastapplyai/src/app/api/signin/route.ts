// /pages/api/signin.ts
import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";
import bcrypt from "bcryptjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  await connectDB();

  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found, please sign up" });

    const isPasswordCorrect = await bcrypt.compare(password, user.password || "");
    if (!isPasswordCorrect)
      return res.status(401).json({ message: "Incorrect password" });

    return res.status(200).json({ message: `Welcome back, ${user.name || "User"}` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}
