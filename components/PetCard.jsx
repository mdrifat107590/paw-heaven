import Image from "next/image";
import Link from "next/link";

export default function PetCard({ pet }) {
  const petId = pet._id || pet.id;

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={pet.image}
          alt={pet.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700">
          {pet.species}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{pet.name}</h3>
          <span className="text-sm font-semibold text-amber-600">
            ৳{pet.fee}
          </span>
        </div>
        <p className="text-sm text-slate-600">
          {pet.breed} · {pet.age} yrs · {pet.gender}
        </p>
        <p className="text-sm text-slate-500">{pet.description}</p>
        <div className="mt-auto">
          <Link
            href={`/pets/${petId}`}
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
