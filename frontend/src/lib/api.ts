const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export type Role = "student" | "faculty";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface Project {
  id: number;
  title: string;
  abstract: string | null;
  domain: string | null;
  year: number | null;
  supervisor: string | null;
  teamMembers: string[];
  pdfPath: string | null;
  createdAt: string;
}

export interface StudentProfile {
  studentId: string | null;
  department: string | null;
  bio: string | null;
  skills: string[];
  interests: string[];
  technologies: string[];
  domains: string[];
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function saveSession(token: string, user: User) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("user");
  return raw ? (JSON.parse(raw) as User) : null;
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401 && token) {
    logout();
    window.location.href = "/login";
  }

  if (res.status === 204) return undefined as T;
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data as T;
}

export const dashboardPath = (role: Role) =>
  role === "faculty" ? "/dashboard/faculty" : "/dashboard/student";
