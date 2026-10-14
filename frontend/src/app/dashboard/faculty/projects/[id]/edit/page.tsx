"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, Project } from "@/lib/api";
import ProjectForm from "@/components/ProjectForm";
import { Alert, PageHeader, Spinner } from "@/components/ui";

export default function EditProjectPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ project: Project }>(`/projects/${id}`)
      .then((d) => setProject(d.project))
      .catch((err) => setError(err.message));
  }, [id]);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Edit project" description="Update the details of this FYP." />
      {error ? <Alert>{error}</Alert> : project ? <ProjectForm project={project} /> : <Spinner />}
    </div>
  );
}
