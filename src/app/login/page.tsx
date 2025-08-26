"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
+      setError("Enter email and password");
      return;
    }
    // mocked auth
    localStorage.setItem("token", "fake-token");
    router.push("/board");
  }

  return (
    <div className="px-4 py-8 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Login (mock)</h1>
      <form onSubmit={submit} className="flex flex-col gap-2">
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="px-3 py-2 border rounded" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="px-3 py-2 border rounded" />
+        {error ? <div className="text-sm text-red-500">{error}</div> : null}
        <div className="flex gap-2 mt-2">
          <button type="submit" className="px-3 py-2 bg-foreground text-background rounded">Login</button>
        </div>
      </form>
    </div>
  );
}
