import Link from "next/link";
import Container from "../components/Container";

export default function NotFound() {
  return (
    <section className="bg-slate-50">
      <Container className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">
          404
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">
          This page went on a walk.
        </h1>
        <p className="max-w-md text-sm text-slate-600">
          The page you are looking for is not available. Let us guide you back
          to available pets.
        </p>
        <Link
          href="/"
          className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
        >
          Back to Home
        </Link>
      </Container>
    </section>
  );
}
