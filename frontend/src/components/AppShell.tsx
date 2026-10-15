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
import { dashboardPath, getUser, logout, Role, saveUser, User } from "@/lib/api";
import UserAvatar from "@/components/UserAvatar";
import { Logo, Spinner } from "@/components/ui";

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

export default function AppShell({ allow, children }: { allow?: Role[]; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const allowedRoles = allow?.join(",");

  useEffect(() => {
    const u = getUser();
    if (!u) {
      router.replace("/login");
      return;
    }
    if (u.mustChangePassword) {
      router.replace("/change-password");
      return;
    }
    if (allowedRoles && !allowedRoles.split(",").includes(u.role)) {
      router.replace(dashboardPath(u.role));
      return;
    }
    setUser(u);
  }, [allowedRoles, router]);

  useEffect(() => setMobileOpen(false), [pathname]);

  if (!user) return <Spinner className="min-h-screen" />;

  const nav = NAV[user.role];
  const active = nav
    .filter((i) => !i.soon && (pathname === i.href || pathname.startsWith(i.href + "/")))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  const updateUser = (updated: User) => {
    saveUser(updated);
    setUser(updated);
  };

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
          <UserAvatar name={user.name} avatar={user.avatar} size={36} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900">{user.name}</p>
            <p className="truncate text-xs capitalize text-slate-500">{user.role}</p>
          </div>
          <button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            title="Log out"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <UserContext.Provider value={{ user, updateUser }}>
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
          <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </UserContext.Provider>
  );
}
