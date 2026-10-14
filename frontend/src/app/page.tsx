import { ArrowRight, Database, Search, Sparkles, Users } from "lucide-react";
import { ButtonLink, Logo } from "@/components/ui";

const features = [
  {
    icon: Database,
    title: "Central FYP repository",
    text: "Faculty upload past project reports so every idea from previous batches is in one place.",
  },
  {
    icon: Search,
    title: "Semantic search",
    text: "Find related projects by meaning, not just matching keywords — even when the wording is different.",
  },
  {
    icon: Sparkles,
    title: "AI recommendations",
    text: "Get suggestions to refine your proposal and make it stand apart from what has been done before.",
  },
  {
    icon: Users,
    title: "Partner matching",
    text: "Discover students with the skills, interests and technologies that complement yours.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <div className="flex items-center gap-2">
          <ButtonLink href="/login" variant="ghost">
            Log in
          </ButtonLink>
          <ButtonLink href="/register">Get started</ButtonLink>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[480px] bg-gradient-to-b from-brand-50 to-white" />
        <div className="relative mx-auto max-w-3xl px-4 pb-20 pt-20 text-center sm:px-6 sm:pt-28">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-medium text-brand-700">
            <Sparkles className="size-3.5" />
            AI powered research intelligence
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Know your FYP idea is original <span className="text-brand-600">before you propose it</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-slate-600">
            Search past Final Year Projects, see how similar your idea is, and find the right partner to build it
            with.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/register" size="lg">
              Create an account <ArrowRight className="size-4" />
            </ButtonLink>
            <ButtonLink href="/login" size="lg" variant="secondary">
              I already have one
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="grid size-10 place-items-center rounded-lg bg-brand-50 text-brand-600">
                <f.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        SZABIST University Karachi · Final Year Project {new Date().getFullYear()}
      </footer>
    </div>
  );
}
