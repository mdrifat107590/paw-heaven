export default function SectionTitle({ eyebrow, title, description }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">
        {eyebrow}
      </p>
      <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="max-w-2xl text-base text-slate-600">{description}</p>
      ) : null}
    </div>
  );
}
