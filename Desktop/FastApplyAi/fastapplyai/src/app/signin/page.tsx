"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { FaGithub, FaApple, FaMicrosoft } from "react-icons/fa";
import ClientOnly from "../components/ClientOnly";

export default function SignInPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: form.email,
        password: form.password,
      });

      if (result?.ok) {
        router.push("/dashboard");
      } else {
        alert(result?.error || "Sign-in failed");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred during sign-in");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: string) => {
    setLoading(true);
    await signIn(provider, { callbackUrl: "/dashboard" });
    setLoading(false);
  };

  return (
    <ClientOnly>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-300 via-blue-200 to-green-200 bg-[length:200%_200%] animate-gradientFlow px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-md text-center relative overflow-hidden"
        >
          <motion.div className="absolute -top-20 -right-20 h-56 w-56 bg-green-200 opacity-40 rounded-full blur-3xl" />

          <div className="flex justify-center mb-5 relative z-10">
            <div className="h-14 w-14 bg-green-500 text-white flex items-center justify-center rounded-2xl font-bold text-lg shadow-md">
              QA
            </div>
          </div>

          <h1 className="text-3xl font-semibold mb-1">Welcome to Hello App</h1>
          <p className="text-gray-500 mb-8">Sign in to continue</p>

          <div className="space-y-3 relative z-10">
            <AnimatedButton icon={<FcGoogle />} text="Continue with Google" onClick={() => handleSocialSignIn("google")} />
            <AnimatedButton icon={<FaGithub />} text="Continue with GitHub" onClick={() => handleSocialSignIn("github")} />
            <AnimatedButton icon={<FaApple />} text="Continue with Apple" onClick={() => handleSocialSignIn("apple")} />
            <AnimatedButton icon={<FaMicrosoft className="text-blue-600" />} text="Continue with Microsoft" onClick={() => handleSocialSignIn("azure-ad")} />
          </div>

          <div className="flex items-center my-6 text-gray-400">
            <hr className="flex-grow border-gray-300" />
            <span className="mx-3 text-sm">OR CONTINUE WITH EMAIL</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          <form onSubmit={handleEmailSignIn} className="space-y-3 relative z-10">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-lg py-2 font-medium text-white transition-all ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {loading ? "Signing in..." : "Continue with Email"}
            </button>
          </form>

          <p className="text-xs text-gray-400 mt-6">
            By continuing, you agree to our{" "}
            <a href="#" className="text-green-500 underline">Terms of Service</a> and{" "}
            <a href="#" className="text-green-500 underline">Privacy Policy</a>.
          </p>

          <div className="mt-6 text-gray-400 text-xs">
            Powered by{" "}
            <span className="inline-flex items-center gap-1 font-semibold text-gray-700">
              <span className="bg-black text-white text-[10px] px-2 py-1 rounded-md">B</span>
              Blink
            </span>
          </div>
        </motion.div>
      </div>
    </ClientOnly>
  );
}

function AnimatedButton({
  icon,
  text,
  onClick,
}: {
  icon: React.ReactNode;
  text: string;
  onClick?: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full border border-gray-200 rounded-lg py-2 flex items-center justify-center gap-2 hover:shadow-md hover:bg-gray-50 transition-all"
    >
      <span className="text-xl">{icon}</span>
      <span>{text}</span>
    </motion.button>
  );
}
