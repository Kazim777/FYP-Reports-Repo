import AppShell from "@/components/AppShell";

export default function FacultyLayout({ children }: { children: React.ReactNode }) {
  return <AppShell allow={["faculty", "admin"]}>{children}</AppShell>;
}
