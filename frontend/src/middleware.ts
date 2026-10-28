import { NextResponse, type NextRequest } from "next/server";
import {
  CHANGE_PASSWORD_PATH,
  SESSION_COOKIE,
  canAccess,
  homePathFor,
  readSessionClaims,
} from "@/lib/session";

const GUEST_ONLY_PATHS = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const session = readSessionClaims(request.cookies.get(SESSION_COOKIE)?.value);
  const redirectTo = (path: string) => NextResponse.redirect(new URL(path, request.url));

  if (!session) {
    if (GUEST_ONLY_PATHS.includes(pathname)) return NextResponse.next();
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  if (session.mustChangePassword) {
    return pathname === CHANGE_PASSWORD_PATH ? NextResponse.next() : redirectTo(CHANGE_PASSWORD_PATH);
  }

  const isEntryPage = GUEST_ONLY_PATHS.includes(pathname) || pathname === CHANGE_PASSWORD_PATH || pathname === "/dashboard";
  if (isEntryPage || !canAccess(session.role, pathname)) {
    return redirectTo(homePathFor(session.role));
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: ["/dashboard/:path*", "/change-password", "/login", "/register"],
};
