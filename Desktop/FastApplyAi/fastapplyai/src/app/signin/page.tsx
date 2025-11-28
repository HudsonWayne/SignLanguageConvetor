"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";

export default function SignInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message);
        router.push("/dashboard");
      } else {
        alert(data.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    window.location.href = "/api/auth/google";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-300 via-blue-200 to-green-200 px-4">
      <div className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-md text-center">
        
        <div className="flex justify-center mb-5">
          <div className="h-14 w-14 bg-green-500 text-white flex items-center justify-center rounded-2xl font-bold text-lg shadow-md">
            QA
          </div>
        </div>

        <h1 className="text-3xl font-semibold mb-1">Welcome to Hello App</h1>
        <p className="text-gray-500 mb-8">Sign in to continue</p>

        <div className="space-y-3">
          <AnimatedButton
            icon={<FcGoogle />}
            text="Continue with Google"
            onClick={handleGoogle}
          />
          <AnimatedButton
            icon={<FaApple />}
            text="Continue with Apple"
            onClick={() => alert("Apple not set up")}
          />
        </div>

        <div className="flex items-center my-6 text-gray-400">
          <hr className="flex-grow border-gray-300" />
          <span className="mx-3 text-sm">OR SIGN IN WITH EMAIL</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        <form onSubmit={handleEmailSignIn} className="space-y-3">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-400"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Enter your password"
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-400"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 text-white rounded-lg ${
              loading ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {loading ? "Signing in..." : "Sign in with Email"}
          </button>
        </form>
      </div>
    </div>
  );
}

function AnimatedButton({ icon, text, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="w-full border border-gray-200 rounded-lg py-2 flex items-center justify-center gap-2 hover:bg-gray-50"
    >
      <span className="text-xl">{icon}</span>
      <span>{text}</span>
    </button>
  );
}
