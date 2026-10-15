const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export type Role = "student" | "faculty" | "admin";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  avatar: string | null;
  mustChangePassword: boolean;
  createdAt: string;
}

export interface TemporaryPasswordResult {
  user: User;
  temporaryPassword: string;
}

export interface AdminStats {
  students: number;
  faculty: number;
  admins: number;
  projects: number;
  reports: number;
  recentUsers: User[];
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  avatar: string | null;
  skills: string[];
  technologies: string[];
  interests: string[];
}

export interface Project {
  id: number;
  title: string;
  abstract: string | null;
  domain: string | null;
  year: number | null;
  supervisor: string | null;
  teamMembers: string[];
  pdfName: string | null;
  pdfSize: number | null;
  createdAt: string;
  text?: ReportSummary | null;
}

export interface ReportSummary {
  pageCount: number;
  wordCount: number;
  extractedAt: string;
}

export interface PdfUploadResult {
  project: Project;
  extraction: {
    pageCount: number;
    wordCount: number;
    isReadable: boolean;
    abstractFilled: boolean;
  };
}

export const MAX_PDF_SIZE_MB = 15;

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

export function saveUser(user: User) {
  localStorage.setItem("user", JSON.stringify(user));
}

export function saveSession(token: string, user: User) {
  localStorage.setItem("token", token);
  saveUser(user);
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

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();
  const isForm = options.body instanceof FormData;
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(isForm ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401 && token) {
    logout();
    window.location.href = "/login";
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Request failed");
  }
  return res;
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await request(path, options);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export function uploadProjectPdf(projectId: number, file: File) {
  const form = new FormData();
  form.append("pdf", file);
  return api<PdfUploadResult>(`/projects/${projectId}/pdf`, { method: "POST", body: form });
}

export async function openProjectPdf(projectId: number) {
  const tab = window.open("", "_blank");
  try {
    const blob = await (await request(`/projects/${projectId}/pdf`)).blob();
    const url = URL.createObjectURL(blob);
    if (tab) tab.location.href = url;
    else window.location.href = url;
  } catch (err) {
    tab?.close();
    throw err;
  }
}

export const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const dashboardPath = (role: Role) => `/dashboard/${role}`;

export const landingPath = (user: User) => (user.mustChangePassword ? "/change-password" : dashboardPath(user.role));
