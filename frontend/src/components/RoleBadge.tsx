import { Role } from "@/lib/api";
import { Badge } from "@/components/ui";

const tones = { student: "slate", faculty: "brand", admin: "amber" } as const;

export default function RoleBadge({ role }: { role: Role }) {
  return (
    <Badge tone={tones[role]}>
      <span className="capitalize">{role}</span>
    </Badge>
  );
}
