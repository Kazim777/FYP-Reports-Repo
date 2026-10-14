"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, saveSession, dashboardPath, Role, User } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" as Role });
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const { token, user } = await api<{ token: string; user: User }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(form),
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
        <h1 className="text-2xl font-semibold">Register</h1>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <input
          className="w-full rounded border p-2"
          placeholder="Full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          className="w-full rounded border p-2"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          className="w-full rounded border p-2"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <select
          className="w-full rounded border p-2"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
        >
          <option value="student">Student</option>
          <option value="faculty">Faculty</option>
        </select>
        <button className="w-full rounded bg-blue-600 p-2 text-white hover:bg-blue-700">Create account</button>
        <p className="text-sm">
          Already registered? <Link href="/login" className="text-blue-600">Login</Link>
        </p>
      </form>
    </main>
  );
}
