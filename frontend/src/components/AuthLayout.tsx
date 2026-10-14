import { CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/ui";

const points = [
  "Browse every past FYP in one repository",
  "Check how similar your idea is to previous work",
  "Find partners with matching skills",
];

export default function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-brand-900 p-12 text-white lg:flex">
        <Logo inverted />
        <div>
          <h2 className="text-3xl font-semibold leading-tight tracking-tight">
            The smarter way to plan your Final Year Project.
          </h2>
          <ul className="mt-8 space-y-4">
            {points.map((p) => (
              <li key={p} className="flex items-center gap-3 text-brand-100">
                <CheckCircle2 className="size-5 text-brand-200" />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-brand-200">SZABIST University Karachi</p>
      </div>

      <div className="flex items-center justify-center bg-white px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <Logo className="mb-10 lg:hidden" />
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
          <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
