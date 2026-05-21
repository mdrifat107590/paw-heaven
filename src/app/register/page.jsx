"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Container from "../../components/Container";
import { useToast } from "../../components/ToastProvider";
import { useAuth } from "../providers";

const validatePassword = (value) => {
  const hasUpper = /[A-Z]/.test(value);
  const hasLower = /[a-z]/.test(value);
  const longEnough = value.length >= 6;
  return hasUpper && hasLower && longEnough;
};

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { addToast } = useToast();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
  const googleAuthUrl =
    process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL || `${apiBaseUrl}/google-auth`;
  const [form, setForm] = useState({
    name: "",
    email: "",
    photoUrl: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validatePassword(form.password)) {
      addToast({
        type: "error",
        message:
          "Password needs 6+ chars with uppercase and lowercase letters.",
      });
      return;
    }

    if (form.password !== form.confirmPassword) {
      addToast({ type: "error", message: "Passwords do not match." });
      return;
    }

    const result = await register({
      name: form.name,
      email: form.email,
      photoUrl: form.photoUrl,
      password: form.password,
    });

    if (!result.ok) {
      addToast({ type: "error", message: result.message });
      return;
    }

    addToast({ type: "success", message: "Account created." });
    router.push("/");
  };

  const handleGoogleSignup = () => {
    window.location.href = `${googleAuthUrl}?callbackURL=${encodeURIComponent("/")}`;
  };

  return (
    <section className="bg-slate-50">
      <Container className="py-16">
        <div className="mx-auto w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8">
          <h1 className="text-3xl font-semibold text-slate-900">
            Create account
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Join PawHaven to adopt and manage requests.
          </p>
          <button
            type="button"
            onClick={handleGoogleSignup}
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
                Name
              </label>
              <input
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">
                Photo URL
              </label>
              <input
                name="photoUrl"
                value={form.photoUrl}
                onChange={handleChange}
                placeholder="https://"
                className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                value={form.password}
                onChange={handleChange}
                className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                required
                value={form.confirmPassword}
                onChange={handleChange}
                className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
            >
              Register
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-slate-900">
              Login
            </Link>
          </p>
        </div>
      </Container>
    </section>
  );
}
