import type { User } from "@/lib/api";
import { Badge } from "@/components/ui";

export default function AccountStatusBadge({ user }: { user: Pick<User, "status" | "mustChangePassword"> }) {
  if (user.status === "deactivated") return <Badge>Deactivated</Badge>;
  if (user.status === "pending") return <Badge tone="amber">Email not verified</Badge>;
  if (user.mustChangePassword) return <Badge tone="amber">Awaiting first login</Badge>;
  return <Badge tone="green">Active</Badge>;
}
