"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, saveSession, dashboardPath, User } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const { token, user } = await api<{ token: string; user: User }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      saveSession(token, user);
      router.push(dashboardPath(user.role));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded border p-6">
        <h1 className="text-2xl font-semibold">Login</h1>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <input
          className="w-full rounded border p-2"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full rounded border p-2"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="w-full rounded bg-blue-600 p-2 text-white hover:bg-blue-700">Login</button>
        <p className="text-sm">
          No account? <Link href="/register" className="text-blue-600">Register</Link>
        </p>
      </form>
    </main>
  );
}
