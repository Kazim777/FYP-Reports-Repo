import DashboardShell from "@/components/DashboardShell";

export default function StudentDashboard() {
  return (
    <DashboardShell role="student" title="Student Dashboard">
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="My Profile" text="Add your skills, interests and technologies." />
        <Card title="Search Past FYPs" text="Keyword search across the repository (FYP I)." />
        <Card title="Find a Partner" text="Coming in FYP II." />
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
