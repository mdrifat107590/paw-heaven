import Container from "./Container";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <Container className="py-10">
        <div className="grid gap-8 md:grid-cols-[1.2fr_1fr_1fr]">
          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-semibold text-slate-900">PawHaven</h3>
            <p className="text-sm text-slate-600">
              Connecting caring families with pets looking for a forever home.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm text-slate-600">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Contact
            </p>
            <p>+880 1712 567 890</p>
            <p>hello@pawhaven.com</p>
            <p>25 Lake Road, Dhaka</p>
          </div>
          <div className="flex flex-col gap-2 text-sm text-slate-600">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Social
            </p>
            <p>Facebook · @pawhaven</p>
            <p>Instagram · @pawhaven</p>
            <p>LinkedIn · PawHaven</p>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-200 pt-4 text-xs text-slate-500">
          Copyright 2026 PawHaven. All rights reserved.
        </div>
      </Container>
    </footer>
  );
}
