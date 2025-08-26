import Link from "next/link";

export default function Home() {
  return (
    <main className="px-4 py-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold">Welcome</h1>
      <p className="mt-2">Open the sprint board after logging in.</p>
      <div className="mt-4">
        <Link href="/login" className="px-3 py-2 bg-foreground text-background rounded">Login</Link>
      </div>
    </main>
  );
}
