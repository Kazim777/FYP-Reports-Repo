export type Role = "student" | "faculty" | "admin";

export const SESSION_COOKIE = "fyp_session";

export interface SessionClaims {
  role: Role;
  mustChangePassword: boolean;
}

const HOME_PATHS: Record<Role, string> = {
  student: "/dashboard/student",
  faculty: "/dashboard/faculty",
  admin: "/dashboard/admin",
};

const ROLE_AREAS: { prefix: string; roles: Role[] }[] = [
  { prefix: "/dashboard/student", roles: ["student"] },
  { prefix: "/dashboard/faculty", roles: ["faculty", "admin"] },
  { prefix: "/dashboard/admin", roles: ["admin"] },
];

export const CHANGE_PASSWORD_PATH = "/change-password";

export const homePathFor = (role: Role) => HOME_PATHS[role];

export const landingPathFor = (user: SessionClaims) =>
  user.mustChangePassword ? CHANGE_PASSWORD_PATH : homePathFor(user.role);

export function canAccess(role: Role, pathname: string) {
  const area = ROLE_AREAS.find(({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  return !area || area.roles.includes(role);
}

export function readSessionClaims(token: string | undefined): SessionClaims | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (typeof payload.exp !== "number" || payload.exp * 1000 <= Date.now()) return null;
    if (!(payload.role in HOME_PATHS)) return null;
    return { role: payload.role, mustChangePassword: Boolean(payload.mcp) };
  } catch {
    return null;
  }
}

export function safeNextPath(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : null;
}
