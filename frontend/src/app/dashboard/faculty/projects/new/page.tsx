import ProjectForm from "@/components/ProjectForm";
import { PageHeader } from "@/components/ui";

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Add project" description="Add a past Final Year Project to the repository." />
      <ProjectForm />
    </div>
  );
}
