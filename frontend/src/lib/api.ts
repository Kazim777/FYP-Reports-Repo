import type { Role } from "@/lib/session";

export type { Role };

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
  studentId: string;
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

export class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string
  ) {
    super(message);
  }
}

function redirectToLogin() {
  if (window.location.pathname === "/login") return;
  const next = encodeURIComponent(window.location.pathname + window.location.search);
  window.location.assign(`/login?next=${next}`);
}

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    if (data.code === "UNAUTHENTICATED") redirectToLogin();
    throw new ApiRequestError(data.message || "Request failed", res.status, data.code);
  }
  return res;
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await request(path, options);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export async function uploadProjectPdf(projectId: number, file: File) {
  const { uploadUrl, pathname } = await api<{ uploadUrl: string; pathname: string }>(
    `/projects/${projectId}/pdf/upload-url`,
    { method: "POST" }
  );

  const upload = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": "application/pdf" },
    body: file,
  });
  if (!upload.ok) throw new Error("The PDF could not be uploaded. Please try again.");

  return api<PdfUploadResult>(`/projects/${projectId}/pdf`, {
    method: "POST",
    body: JSON.stringify({ pathname, fileName: file.name }),
  });
}

export async function openProjectPdf(projectId: number) {
  const tab = window.open("", "_blank");
  try {
    const { url } = await api<{ url: string }>(`/projects/${projectId}/pdf`);
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

export const logout = () => api<void>("/auth/logout", { method: "POST" });
