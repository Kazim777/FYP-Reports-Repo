"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { KeyRound, Search, Trash2, UserPlus, Users } from "lucide-react";
import { api, formatDate, Role, TemporaryPasswordResult, User } from "@/lib/api";
import { useCurrentUser } from "@/components/AppShell";
import RoleBadge from "@/components/RoleBadge";
import TemporaryPasswordCard from "@/components/TemporaryPasswordCard";
import UserAvatar from "@/components/UserAvatar";
import { Alert, Badge, Button, ButtonLink, Card, EmptyState, Input, PageHeader, Spinner } from "@/components/ui";

const roleFilters: { value: Role | null; label: string }[] = [
  { value: null, label: "All" },
  { value: "student", label: "Students" },
  { value: "faculty", label: "Faculty" },
  { value: "admin", label: "Admins" },
];

export default function UsersPage() {
  const currentUser = useCurrentUser();
  const [users, setUsers] = useState<User[] | null>(null);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<Role | null>(null);
  const [error, setError] = useState("");
  const [resetResult, setResetResult] = useState<TemporaryPasswordResult | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (role) params.set("role", role);
      api<{ users: User[] }>(`/admin/users?${params}`)
        .then((d) => setUsers(d.users))
        .catch((err) => setError(err.message));
    }, 300);
    return () => clearTimeout(timer);
  }, [query, role]);

  async function resetPassword(user: User) {
    if (!confirm(`Reset the password for ${user.name}? Their current password will stop working.`)) return;
    setError("");
    try {
      const result = await api<TemporaryPasswordResult>(`/admin/users/${user.id}/reset-password`, { method: "POST" });
      setResetResult(result);
      setUsers((list) => list?.map((u) => (u.id === user.id ? result.user : u)) ?? null);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function deleteUser(user: User) {
    if (!confirm(`Delete ${user.name}'s account? This cannot be undone.`)) return;
    setError("");
    try {
      await api(`/admin/users/${user.id}`, { method: "DELETE" });
      setUsers((list) => list?.filter((u) => u.id !== user.id) ?? null);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <>
      <PageHeader
        title="Users"
        description="Everyone with an account on FYP Hub."
        action={
          <ButtonLink href="/dashboard/admin/faculty/new">
            <UserPlus className="size-4" /> Add faculty
          </ButtonLink>
        }
      />

      {error && (
        <div className="mb-6">
          <Alert>{error}</Alert>
        </div>
      )}

      {resetResult && (
        <div className="mb-6">
          <TemporaryPasswordCard result={resetResult} title="Password reset">
            <Button variant="secondary" size="sm" onClick={() => setResetResult(null)}>
              Done
            </Button>
          </TemporaryPasswordCard>
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or email…"
              className="pl-9"
            />
          </div>
          <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
            {roleFilters.map((f) => (
              <button
                key={f.label}
                onClick={() => setRole(f.value)}
                className={clsx(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition",
                  role === f.value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {!users ? (
          <Spinner />
        ) : users.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={Users} title="No users found" description="Try a different search or filter." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">User</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const isSelf = u.id === currentUser.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <UserAvatar name={u.name} avatar={u.avatar} size={36} />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-900">
                              {u.name} {isSelf && <span className="text-xs font-normal text-slate-400">(you)</span>}
                            </p>
                            <p className="truncate text-xs text-slate-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <RoleBadge role={u.role} />
                      </td>
                      <td className="px-5 py-3.5">
                        {u.mustChangePassword ? <Badge tone="amber">Awaiting first login</Badge> : <Badge tone="green">Active</Badge>}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">{formatDate(u.createdAt)}</td>
                      <td className="px-5 py-3.5">
                        {!isSelf && (
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => resetPassword(u)}
                              className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                              title="Reset password"
                            >
                              <KeyRound className="size-4" />
                            </button>
                            <button
                              onClick={() => deleteUser(u)}
                              className="rounded-md p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                              title="Delete user"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
