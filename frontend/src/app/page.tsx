import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-3xl font-bold">AI Powered FYP Repository</h1>
      <p className="max-w-xl text-gray-600">
        Search past Final Year Projects, check how similar your idea is, and find FYP partners.
      </p>
      <div className="flex gap-4">
        <Link href="/login" className="rounded bg-blue-600 px-5 py-2 text-white hover:bg-blue-700">
          Login
        </Link>
        <Link href="/register" className="rounded border px-5 py-2 hover:bg-gray-100">
          Register
        </Link>
      </div>
    </main>
  );
}
