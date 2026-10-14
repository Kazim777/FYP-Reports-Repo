import { Card } from "@/components/ui";

export default function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
        <Icon className="size-5" />
      </span>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
      </div>
    </Card>
  );
}
