"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import {
  FilePlus2,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  Sparkles,
  UserPlus,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { api, logout, Role, User } from "@/lib/api";
import UserAvatar from "@/components/UserAvatar";
import { Alert, Button, Logo, Spinner } from "@/components/ui";

type NavItem = { href: string; label: string; icon: React.ElementType; soon?: boolean };

const NAV: Record<Role, NavItem[]> = {
  student: [
    { href: "/dashboard/student", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/student/search", label: "Search Projects", icon: Search },
    { href: "/dashboard/student/profile", label: "My Profile", icon: UserRound },
    { href: "#", label: "Similarity Check", icon: Sparkles, soon: true },
    { href: "#", label: "Find Partners", icon: Users, soon: true },
    { href: "/dashboard/account", label: "Account", icon: Settings },
  ],
  faculty: [
    { href: "/dashboard/faculty", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/faculty/projects", label: "Manage Projects", icon: FolderKanban },
    { href: "/dashboard/faculty/projects/new", label: "Add Project", icon: FilePlus2 },
    { href: "/dashboard/account", label: "Account", icon: Settings },
  ],
  admin: [
    { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/admin/users", label: "Users", icon: Users },
    { href: "/dashboard/admin/faculty/new", label: "Add Faculty", icon: UserPlus },
    { href: "/dashboard/faculty/projects", label: "Projects", icon: FolderKanban },
    { href: "/dashboard/account", label: "Account", icon: Settings },
  ],
};

const UserContext = createContext<{ user: User; updateUser: (user: User) => void } | null>(null);

function useUserContext() {
  const context = useContext(UserContext);
  if (!context) throw new Error("User hooks must be used inside AppShell");
  return context;
}

export const useCurrentUser = () => useUserContext().user;

export const useUpdateUser = () => useUserContext().updateUser;

export default function AppShell({ role, children }: { role: Role; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loadError, setLoadError] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    api<{ user: User }>("/auth/me")
      .then(({ user }) => setUser(user))
      .catch((err) => setLoadError(err.message));
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  const nav = NAV[user?.role ?? role];
  const active = nav
    .filter((item) => !item.soon && (pathname === item.href || pathname.startsWith(`${item.href}/`)))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  async function handleLogout() {
    await logout().catch(() => undefined);
    router.replace("/login");
    router.refresh();
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5">
        <Logo />
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {nav.map((item) =>
          item.soon ? (
            <span
              key={item.label}
              className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400"
            >
              <item.icon className="size-4" />
              {item.label}
              <span className="ml-auto rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium uppercase text-slate-500">
                Soon
              </span>
            </span>
          ) : (
            <Link
              key={item.label}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active === item.href
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          )
        )}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          {user ? (
            <>
              <UserAvatar name={user.name} avatar={user.avatar} size={36} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">{user.name}</p>
                <p className="truncate text-xs capitalize text-slate-500">{user.role}</p>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center gap-3">
              <span className="size-9 animate-pulse rounded-full bg-slate-100" />
              <span className="h-3 w-24 animate-pulse rounded bg-slate-100" />
            </div>
          )}
          <button
            onClick={handleLogout}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            title="Log out"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );

  let content: React.ReactNode = <Spinner />;
  if (user) {
    content = <UserContext.Provider value={{ user, updateUser: setUser }}>{children}</UserContext.Provider>;
  } else if (loadError) {
    content = (
      <div className="mx-auto max-w-md space-y-4 py-16">
        <Alert>{loadError}</Alert>
        <Button variant="secondary" onClick={() => window.location.reload()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white lg:block">{sidebar}</aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/30" onClick={() => setMobileOpen(false)} />
          <aside className="relative h-full w-64 bg-white shadow-xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
            >
              <X className="size-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur lg:hidden">
          <button onClick={() => setMobileOpen(true)} className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100">
            <Menu className="size-5" />
          </button>
          <Logo />
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{content}</main>
      </div>
    </div>
  );
}
