export default function Spinner({ label = "Loading" }) {
  return (
    <div className="flex items-center justify-center gap-3 py-12 text-sm font-semibold text-slate-600">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
      {label}
    </div>
  );
}
