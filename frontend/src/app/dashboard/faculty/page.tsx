import DashboardShell from "@/components/DashboardShell";

export default function FacultyDashboard() {
  return (
    <DashboardShell role="faculty" title="Faculty Dashboard">
      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Upload FYP Report" text="Add a past project with its PDF report." />
        <Card title="Manage Reports" text="Edit or delete projects in the repository." />
      </div>
    </DashboardShell>
  );
}

function Card({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded border p-4">
      <h2 className="font-semibold">{title}</h2>
      <p className="text-sm text-gray-600">{text}</p>
    </div>
  );
}
