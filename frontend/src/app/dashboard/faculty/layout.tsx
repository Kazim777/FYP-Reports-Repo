import AppShell from "@/components/AppShell";

export default function FacultyLayout({ children }: { children: React.ReactNode }) {
  return <AppShell role="faculty">{children}</AppShell>;
}
