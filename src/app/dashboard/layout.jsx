import Link from "next/link";
import { Suspense } from "react";
import Container from "../../components/Container";
import Spinner from "../../components/Spinner";

const links = [
  { href: "/dashboard/my-requests", label: "My Requests" },
  { href: "/dashboard/add-pet", label: "Add Pet" },
  { href: "/dashboard/my-listings", label: "My Listings" },
];

export default function DashboardLayout({ children }) {
  return (
    <section className="min-h-[calc(100vh-200px)] bg-slate-50">
      <Container className="grid gap-6 py-10 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-3xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">Dashboard</h2>
          <nav className="mt-4 flex flex-col gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-2xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <Suspense fallback={<Spinner label="Loading dashboard" />}>
            {children}
          </Suspense>
        </div>
      </Container>
    </section>
  );
}
