"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { FaGithub, FaApple, FaMicrosoft } from "react-icons/fa";
import ClientOnly from "../components/ClientOnly";

export default function SignUpPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    alert(data.message);
  };

  return (
    <ClientOnly>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-300 via-blue-200 to-green-200 bg-[length:200%_200%] animate-gradientFlow px-4">
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-md text-center relative overflow-hidden"
        >
          <motion.div
            initial={false}
            animate={{ scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="absolute -top-20 -right-20 h-56 w-56 bg-green-200 opacity-40 rounded-full blur-3xl"
          />

          <motion.div
            initial={false}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex justify-center mb-5 relative z-10"
          >
            <div className="h-14 w-14 bg-green-500 text-white flex items-center justify-center rounded-2xl font-bold text-lg shadow-md">
              QA
            </div>
          </motion.div>

          <motion.h1
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-3xl font-semibold mb-1"
          >
            Create your account
          </motion.h1>
          <motion.p
            initial={false}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-500 mb-8"
          >
            Sign up to get started
          </motion.p>

          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-3 relative z-10"
          >
            <AnimatedButton icon={<FcGoogle />} text="Sign up with Google" />
            <AnimatedButton icon={<FaGithub />} text="Sign up with GitHub" />
            <AnimatedButton icon={<FaApple />} text="Sign up with Apple" />
            <AnimatedButton
              icon={<FaMicrosoft className="text-blue-600" />}
              text="Sign up with Microsoft"
            />
          </motion.div>

          <motion.div
            initial={false}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center my-6 text-gray-400"
          >
            <hr className="flex-grow border-gray-300" />
            <span className="mx-3 text-sm">OR SIGN UP WITH EMAIL</span>
            <hr className="flex-grow border-gray-300" />
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="space-y-3 relative z-10"
          >
            <input
              type="text"
              placeholder="Full Name"
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email Address"
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            <button
              type="submit"
              className="w-full bg-green-500 text-white rounded-lg py-2 font-medium hover:bg-green-600 transition-all"
            >
              Sign Up
            </button>
          </motion.form>

          <motion.p
            initial={false}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-xs text-gray-400 mt-6"
          >
            By signing up, you agree to our{" "}
            <a href="#" className="text-green-500 underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-green-500 underline">
              Privacy Policy
            </a>
            .
          </motion.p>

          <motion.div
            initial={false}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="mt-6 text-gray-400 text-xs"
          >
            Powered by{" "}
            <span className="inline-flex items-center gap-1 font-semibold text-gray-700">
              <span className="bg-black text-white text-[10px] px-2 py-1 rounded-md">
                B
              </span>
              Blink
            </span>
          </motion.div>
        </motion.div>
      </div>
    </ClientOnly>
  );
}

function AnimatedButton({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <motion.button
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="w-full border border-gray-200 rounded-lg py-2 flex items-center justify-center gap-2 hover:shadow-md hover:bg-gray-50 transition-all"
    >
      <span className="text-xl">{icon}</span>
      <span>{text}</span>
    </motion.button>
  );
}
