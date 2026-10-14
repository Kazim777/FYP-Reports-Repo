"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Database, FolderSearch, Layers, Sparkles, UserRound } from "lucide-react";
import { api, Project, StudentProfile } from "@/lib/api";
import { useCurrentUser } from "@/components/AppShell";
import ProjectCard from "@/components/ProjectCard";
import StatCard from "@/components/StatCard";
import { ButtonLink, Card, EmptyState, PageHeader, Spinner } from "@/components/ui";

function profileCompletion(p: StudentProfile | null) {
  if (!p) return 0;
  const checks = [p.studentId, p.department, p.bio, p.skills.length, p.interests.length, p.technologies.length, p.domains.length];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export default function StudentOverview() {
  const user = useCurrentUser();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);

  useEffect(() => {
    api<{ projects: Project[] }>("/projects").then((d) => setProjects(d.projects)).catch(() => setProjects([]));
    api<{ profile: StudentProfile | null }>("/profiles/me").then((d) => setProfile(d.profile)).catch(() => {});
  }, []);

  const completion = profileCompletion(profile);
  const domains = new Set(projects?.map((p) => p.domain).filter(Boolean));

  return (
    <>
      <PageHeader
        title={`Hi, ${user.name.split(" ")[0]} 👋`}
        description="Explore past projects and get your FYP idea ready."
        action={
          <ButtonLink href="/dashboard/student/search">
            <FolderSearch className="size-4" /> Search projects
          </ButtonLink>
        }
      />

      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard icon={Database} label="Projects in repository" value={projects?.length ?? "–"} />
        <StatCard icon={Layers} label="Research domains" value={projects ? domains.size : "–"} />
        <StatCard icon={UserRound} label="Profile complete" value={`${completion}%`} />
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Recently added projects</h2>
            <Link
              href="/dashboard/student/search"
              className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              View all <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="mt-5">
            {!projects ? (
              <Spinner />
            ) : projects.length === 0 ? (
              <EmptyState
                icon={Database}
                title="No projects yet"
                description="Faculty haven't uploaded any past FYPs yet."
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {projects.slice(0, 4).map((p) => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </div>
            )}
          </div>
        </Card>

        <div className="space-y-5">
          <Card className="p-6">
            <h2 className="font-semibold text-slate-900">Your profile</h2>
            <p className="mt-1 text-sm text-slate-500">
              A complete profile helps other students find you as a partner.
            </p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${completion}%` }} />
            </div>
            <p className="mt-2 text-xs text-slate-500">{completion}% complete</p>
            <ButtonLink href="/dashboard/student/profile" variant="secondary" className="mt-5 w-full">
              {completion === 100 ? "View profile" : "Complete profile"}
            </ButtonLink>
          </Card>

          <Card className="bg-gradient-to-br from-brand-600 to-brand-700 p-6 text-white">
            <Sparkles className="size-5 text-brand-200" />
            <h2 className="mt-3 font-semibold">Similarity check</h2>
            <p className="mt-1 text-sm text-brand-100">
              Soon you&apos;ll be able to paste your proposal and see how close it is to past projects.
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}
