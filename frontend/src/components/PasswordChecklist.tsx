import clsx from "clsx";
import { Check, Circle } from "lucide-react";
import { PASSWORD_RULES } from "@/lib/password";

export default function PasswordChecklist({ password }: { password: string }) {
  return (
    <ul className="mt-2 space-y-1 text-xs">
      {PASSWORD_RULES.map((rule) => {
        const passed = rule.test(password);
        const Icon = passed ? Check : Circle;
        return (
          <li
            key={rule.label}
            className={clsx("flex items-center gap-1.5", passed ? "text-emerald-600" : "text-slate-500")}
          >
            <Icon className="size-3.5" aria-hidden />
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}
