"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../app/providers";

const NavLink = ({ href, label }) => {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={`text-sm font-semibold transition ${
        active ? "text-slate-900" : "text-slate-600 hover:text-slate-900"
      }`}
    >
      {label}
    </Link>
  );
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handlePrivateNav = (path) => {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(path)}`);
      return;
    }
    router.push(path);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white">
            PH
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">PawHaven</p>
            <p className="text-xs text-slate-500">Pet Adoption</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLink href="/" label="Home" />
          <NavLink href="/all-pets" label="All Pets" />
          <button
            type="button"
            onClick={() => handlePrivateNav("/dashboard/my-requests")}
            className="text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            My Requests
          </button>
          <button
            type="button"
            onClick={() => handlePrivateNav("/dashboard/add-pet")}
            className="text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            Add Pet
          </button>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <details className="relative">
              <summary className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">
                <span className="hidden sm:inline">{user.name}</span>
                <span className="h-6 w-6 rounded-full bg-slate-900 text-[10px] font-bold text-white flex items-center justify-center">
                  {user.name?.slice(0, 1)?.toUpperCase() || "U"}
                </span>
              </summary>
              <div className="absolute right-0 mt-2 w-44 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Dashboard
                </button>
                <button
                  type="button"
                  onClick={logout}
                  className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50"
                >
                  Logout
                </button>
              </div>
            </details>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
