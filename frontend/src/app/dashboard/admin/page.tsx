"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Database, FileText, GraduationCap, UserPlus } from "lucide-react";
import { AdminStats, api, formatDate } from "@/lib/api";
import { useCurrentUser } from "@/components/AppShell";
import RoleBadge from "@/components/RoleBadge";
import StatCard from "@/components/StatCard";
import UserAvatar from "@/components/UserAvatar";
import { Alert, ButtonLink, Card, PageHeader, Spinner } from "@/components/ui";

export default function AdminOverview() {
  const user = useCurrentUser();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<AdminStats>("/admin/stats")
      .then(setStats)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <>
      <PageHeader
        title={`Welcome, ${user.name}`}
        description="Manage users and keep the FYP repository in shape."
        action={
          <ButtonLink href="/dashboard/admin/faculty/new">
            <UserPlus className="size-4" /> Add faculty
          </ButtonLink>
        }
      />

      {error && <Alert>{error}</Alert>}
      {!stats && !error && <Spinner />}

      {stats && (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={GraduationCap} label="Students" value={stats.students} />
            <StatCard icon={BookOpen} label="Faculty" value={stats.faculty} />
            <StatCard icon={Database} label="Projects" value={stats.projects} />
            <StatCard icon={FileText} label="PDF reports" value={stats.reports} />
          </div>

          <Card className="mt-8">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="font-semibold text-slate-900">Recent sign-ups</h2>
              <Link
                href="/dashboard/admin/users"
                className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                All users <ArrowRight className="size-3.5" />
              </Link>
            </div>
            <ul className="divide-y divide-slate-100">
              {stats.recentUsers.map((u) => (
                <li key={u.id} className="flex items-center gap-4 px-6 py-3.5">
                  <UserAvatar name={u.name} avatar={u.avatar} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{u.name}</p>
                    <p className="truncate text-xs text-slate-500">{u.email}</p>
                  </div>
                  <RoleBadge role={u.role} />
                  <span className="hidden w-24 text-right text-xs text-slate-500 sm:block">{formatDate(u.createdAt)}</span>
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}
    </>
  );
}
