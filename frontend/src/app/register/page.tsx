"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { api, RegisterInput, User } from "@/lib/api";
import { homePathFor } from "@/lib/session";
import { INTEREST_OPTIONS, SKILL_OPTIONS, TECHNOLOGY_OPTIONS } from "@/lib/options";
import AuthLayout from "@/components/AuthLayout";
import AvatarPicker from "@/components/AvatarPicker";
import TagPicker from "@/components/TagPicker";
import { Alert, Button, Field, Input } from "@/components/ui";

const emptyForm: RegisterInput = {
  name: "",
  email: "",
  password: "",
  avatar: null,
  skills: [],
  technologies: [],
  interests: [],
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<RegisterInput>(emptyForm);
  const [step, setStep] = useState<"account" | "skills">("account");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (changes: Partial<RegisterInput>) => setForm((current) => ({ ...current, ...changes }));

  async function createAccount() {
    setError("");
    setLoading(true);
    try {
      const { user } = await api<{ user: User }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(form),
      });
      router.replace(homePathFor(user.role));
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  function handleAccountStep(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError("");
    setStep("skills");
  }

  function handleSkillsStep(e: React.FormEvent) {
    e.preventDefault();
    if (form.skills.length === 0) {
      setError("Select at least one skill.");
      return;
    }
    createAccount();
  }

  if (step === "skills") {
    return (
      <AuthLayout
        wide
        eyebrow="Step 2 of 2"
        title="What are you good at?"
        subtitle="This helps other students find you as an FYP partner. You can change it any time from your profile."
      >
        <form onSubmit={handleSkillsStep} className="space-y-7">
          {error && <Alert>{error}</Alert>}
          <Field label="Skills" hint="Pick at least one.">
            <TagPicker
              options={SKILL_OPTIONS}
              value={form.skills}
              onChange={(skills) => update({ skills })}
              addPlaceholder="Add another skill…"
            />
          </Field>
          <Field label="Technologies">
            <TagPicker
              options={TECHNOLOGY_OPTIONS}
              value={form.technologies}
              onChange={(technologies) => update({ technologies })}
              addPlaceholder="Add another technology…"
            />
          </Field>
          <Field label="Interests">
            <TagPicker
              options={INTEREST_OPTIONS}
              value={form.interests}
              onChange={(interests) => update({ interests })}
              addPlaceholder="Add another interest…"
            />
          </Field>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setError("");
                setStep("account");
              }}
            >
              <ArrowLeft className="size-4" /> Back
            </Button>
            <Button type="submit" loading={loading} className="flex-1">
              Create account
            </Button>
          </div>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow="Step 1 of 2"
      title="Create your student account"
      subtitle="Join the FYP repository in less than a minute."
    >
      <form onSubmit={handleAccountStep} className="space-y-5">
        {error && <Alert>{error}</Alert>}

        <Field label="Choose an avatar" hint="Optional. You can change it later.">
          <AvatarPicker value={form.avatar} onChange={(avatar) => update({ avatar })} />
        </Field>

        <Field label="Full name" htmlFor="name">
          <Input
            id="name"
            placeholder="Ali Khan"
            value={form.name}
            onChange={(e) => update({ name: e.target.value })}
            required
          />
        </Field>
        <Field label="Email" htmlFor="email">
          <Input
            id="email"
            type="email"
            placeholder="you@szabist.pk"
            value={form.email}
            onChange={(e) => update({ email: e.target.value })}
            required
          />
        </Field>
        <Field label="Password" htmlFor="password" hint="At least 6 characters.">
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => update({ password: e.target.value })}
            required
          />
        </Field>
        <Button type="submit" className="w-full">
          Continue <ArrowRight className="size-4" />
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Already registered?{" "}
        <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700">
          Log in
        </Link>
      </p>
      <p className="mt-3 text-center text-xs text-slate-400">
        Faculty accounts are created by the administrator.
      </p>
    </AuthLayout>
  );
}
