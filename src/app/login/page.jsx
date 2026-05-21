"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Container from "../../components/Container";
import { useToast } from "../../components/ToastProvider";
import { useAuth } from "../providers";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { addToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
  const googleAuthUrl =
    process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL || `${apiBaseUrl}/google-auth`;

  const nextPath = searchParams.get("next") || "/";

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await login({ email, password });
    if (!result.ok) {
      addToast({ type: "error", message: result.message });
      return;
    }
    addToast({ type: "success", message: "Welcome back." });
    router.push(nextPath);
  };

  const handleGoogleLogin = () => {
    window.location.href = `${googleAuthUrl}?callbackURL=${encodeURIComponent(nextPath)}`;
  };

  return (
    <section className="bg-slate-50">
      <Container className="py-16">
        <div className="mx-auto w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8">
          <h1 className="text-3xl font-semibold text-slate-900">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-500">
            Log in to manage requests and adopt your favorite pet.
          </p>
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
              G
            </span>
            Continue with Google
          </button>
          <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            Or
            <span className="h-px flex-1 bg-slate-200" />
          </div>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
            >
              Login
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-600">
            New here?{" "}
            <Link href="/register" className="font-semibold text-slate-900">
              Register
            </Link>
          </p>
        </div>
      </Container>
    </section>
  );
}
