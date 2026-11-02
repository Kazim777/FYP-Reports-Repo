"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { api, formatDate, UserDetails } from "@/lib/api";
import AccountStatusBadge from "@/components/AccountStatusBadge";
import RoleBadge from "@/components/RoleBadge";
import UserAvatar from "@/components/UserAvatar";
import { Alert, Badge, Card, PageHeader, Spinner } from "@/components/ui";

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-900">{children || <span className="text-slate-400">Not set</span>}</dd>
    </div>
  );
}

function Tags({ values }: { values?: string[] }) {
  if (!values?.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {values.map((value) => (
        <Badge key={value} tone="brand">
          {value}
        </Badge>
      ))}
    </div>
  );
}

const yesNo = (value?: boolean) => (value ? "Yes" : "No");

export default function UserDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [details, setDetails] = useState<UserDetails | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<UserDetails>(`/admin/users/${id}`)
      .then(setDetails)
      .catch((err) => setError(err.message));
  }, [id]);

  const back = (
    <Link
      href="/dashboard/admin/users"
      className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
    >
      <ArrowLeft className="size-4" /> All users
    </Link>
  );

  if (error) {
    return (
      <>
        {back}
        <Alert>{error}</Alert>
      </>
    );
  }
  if (!details) return <Spinner />;

  const { user, profile } = details;

  return (
    <>
      {back}
      <PageHeader title={user.name} description={user.email} />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="h-fit p-6 text-center">
          <UserAvatar name={user.name} avatar={user.avatar} size={64} className="mx-auto" />
          <h2 className="mt-4 font-semibold text-slate-900">{user.name}</h2>
          <div className="mt-3 flex justify-center gap-2">
            <RoleBadge role={user.role} />
            <AccountStatusBadge user={user} />
          </div>
          <dl className="mt-6 space-y-4 text-left">
            <Detail label="Joined">{formatDate(user.createdAt)}</Detail>
            <Detail label="Last login">{user.lastLoginAt && formatDate(user.lastLoginAt)}</Detail>
          </dl>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h3 className="font-semibold text-slate-900">Profile</h3>
          {user.role === "admin" ? (
            <p className="mt-2 text-sm text-slate-500">Admin accounts don&apos;t have a profile.</p>
          ) : !profile ? (
            <p className="mt-2 text-sm text-slate-500">This user hasn&apos;t filled in their profile yet.</p>
          ) : user.role === "student" ? (
            <dl className="mt-5 grid gap-5 sm:grid-cols-2">
              <Detail label="Student ID">{profile.studentId}</Detail>
              <Detail label="Department">{profile.department}</Detail>
              <Detail label="Looking for a partner">{yesNo(profile.lookingForPartner)}</Detail>
              <Detail label="Email visible to students">{yesNo(profile.showEmail)}</Detail>
              <div className="sm:col-span-2">
                <Detail label="Bio">{profile.bio}</Detail>
              </div>
              <Detail label="Skills"><Tags values={profile.skills} /></Detail>
              <Detail label="Technologies"><Tags values={profile.technologies} /></Detail>
              <Detail label="Interests"><Tags values={profile.interests} /></Detail>
              <Detail label="Preferred domains"><Tags values={profile.domains} /></Detail>
            </dl>
          ) : (
            <dl className="mt-5 grid gap-5 sm:grid-cols-2">
              <Detail label="Department">{profile.department}</Detail>
              <Detail label="Designation">{profile.designation}</Detail>
              <div className="sm:col-span-2">
                <Detail label="Research areas"><Tags values={profile.researchAreas} /></Detail>
              </div>
            </dl>
          )}
        </Card>
      </div>
    </>
  );
}
