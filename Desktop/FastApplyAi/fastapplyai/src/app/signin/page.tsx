"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { FaGithub, FaApple, FaMicrosoft } from "react-icons/fa";
import ClientOnly from "../components/ClientOnly";

export default function SignInPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email) return alert("Please enter your email");

    setLoading(true);
    try {
      const res = await fetch("/api/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message || "Sign-in successful!");
        // Redirect to dashboard or homepage
        router.push("/dashboard");
      } else {
        alert(data.message || "Sign-in failed. Try again.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
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
          {/* Decorative Circle */}
          <motion.div
            initial={false}
            animate={{ scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="absolute -top-20 -right-20 h-56 w-56 bg-green-200 opacity-40 rounded-full blur-3xl"
          />

          {/* Logo */}
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

          {/* Title */}
          <motion.h1
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-3xl font-semibold mb-1"
          >
            Welcome to Hello App
          </motion.h1>
          <motion.p
            initial={false}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-500 mb-8"
          >
            Sign in to continue
          </motion.p>

          {/* Social Buttons */}
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-3 relative z-10"
          >
            <AnimatedButton icon={<FcGoogle />} text="Continue with Google" />
            <AnimatedButton icon={<FaGithub />} text="Continue with GitHub" />
            <AnimatedButton icon={<FaApple />} text="Continue with Apple" />
            <AnimatedButton
              icon={<FaMicrosoft className="text-blue-600" />}
              text="Continue with Microsoft"
            />
          </motion.div>

          {/* Divider */}
          <motion.div
            initial={false}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center my-6 text-gray-400"
          >
            <hr className="flex-grow border-gray-300" />
            <span className="mx-3 text-sm">OR CONTINUE WITH EMAIL</span>
            <hr className="flex-grow border-gray-300" />
          </motion.div>

          {/* Email Form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="space-y-3 relative z-10"
          >
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />

            <button
              type="submit"
              className={`w-full rounded-lg py-2 font-medium text-white transition-all ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600"
              }`}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Continue with Email"}
            </button>
          </motion.form>

          {/* Terms */}
          <motion.p
            initial={false}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-xs text-gray-400 mt-6"
          >
            By continuing, you agree to our{" "}
            <a href="#" className="text-green-500 underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-green-500 underline">
              Privacy Policy
            </a>
            .
          </motion.p>

          {/* Footer */}
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

/* Animated Button Component */
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
