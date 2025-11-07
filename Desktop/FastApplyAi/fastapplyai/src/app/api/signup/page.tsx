"use client";

import { useState } from "react";

export default function SignInPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleSubmit = async (e: any) => {
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
    <div className="p-10 max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-4">Sign Up</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          placeholder="Full name"
          className="w-full p-2 border rounded"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          placeholder="Email"
          className="w-full p-2 border rounded"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          placeholder="Password"
          type="password"
          className="w-full p-2 border rounded"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button
          type="submit"
          className="bg-green-500 text-white rounded px-4 py-2"
        >
          Register
        </button>
      </form>
    </div>
  );
}
