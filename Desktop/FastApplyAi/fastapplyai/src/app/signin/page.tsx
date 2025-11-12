"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import ClientOnly from "../components/ClientOnly";

export default function SignInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSocialSignIn = async (provider: string) => {
    setLoading(true);
    await signIn(provider, { callbackUrl: "/dashboard" });
    setLoading(false);
  };

  return (
    <ClientOnly>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-300 via-blue-200 to-green-200 px-4">
        <div className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-md text-center relative overflow-hidden">
          <div className="flex justify-center mb-5 relative z-10">
            <div className="h-14 w-14 bg-green-500 text-white flex items-center justify-center rounded-2xl font-bold text-lg shadow-md">
              QA
            </div>
          </div>

          <h1 className="text-3xl font-semibold mb-1">Welcome to Hello App</h1>
          <p className="text-gray-500 mb-8">Sign in to continue</p>

          <div className="space-y-3 relative z-10">
            <AnimatedButton
              icon={<FcGoogle />}
              text="Continue with Google"
              onClick={() => handleSocialSignIn("google")}
            />
            <AnimatedButton
              icon={<FaApple />}
              text="Continue with Apple"
              onClick={() => handleSocialSignIn("apple")}
            />
          </div>
        </div>
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
    <button
      onClick={onClick}
      className="w-full border border-gray-200 rounded-lg py-2 flex items-center justify-center gap-2 hover:shadow-md hover:bg-gray-50 transition-all"
    >
      <span className="text-xl">{icon}</span>
      <span>{text}</span>
    </button>
  );
}
