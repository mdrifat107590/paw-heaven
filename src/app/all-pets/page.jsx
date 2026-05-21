"use client";

import { useEffect, useState } from "react";
import Container from "../../components/Container";
import PetCard from "../../components/PetCard";
import SectionTitle from "../../components/SectionTitle";
import Spinner from "../../components/Spinner";
import { speciesOptions } from "../../lib/mockData";
import { useToast } from "../../components/ToastProvider";
import { getPets } from "../../lib/api";

export default function AllPetsPage() {
  const [search, setSearch] = useState("");
  const [species, setSpecies] = useState("All");
  const [sort, setSort] = useState("default");
  const { addToast } = useToast();
  const [pets, setPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadPets = async () => {
      setIsLoading(true);
      try {
        const data = await getPets({ search, species, sort });
        if (!isMounted) return;
        setPets(data.pets || []);
      } catch (error) {
        if (!isMounted) return;
        addToast({ type: "error", message: error.message });
        setPets([]);
      } finally {
        if (!isMounted) return;
        setIsLoading(false);
      }
    };

    loadPets();

    return () => {
      isMounted = false;
    };
  }, [search, species, sort, addToast]);

  return (
    <section className="bg-slate-50">
      <Container className="py-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionTitle
            eyebrow="All Pets"
            title="Find your next best friend"
            description="Use search, filters, and sorting to explore every available pet."
          />
          <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr_1fr]">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name"
              className="h-11 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700"
            />
            <select
              value={species}
              onChange={(event) => setSpecies(event.target.value)}
              className="h-11 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700"
            >
              <option value="All">All Species</option>
              {speciesOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="h-11 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700"
            >
              <option value="default">Sort</option>
              <option value="fee-low">Fee: Low to High</option>
              <option value="fee-high">Fee: High to Low</option>
              <option value="age-low">Age: Low to High</option>
              <option value="age-high">Age: High to Low</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <Spinner label="Loading pets" />
        ) : null}
        {!isLoading ? (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pets.map((pet) => (
              <PetCard key={pet._id || pet.id} pet={pet} />
            ))}
          </div>
        ) : null}
        {!isLoading && pets.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
            No pets match your search. Try clearing filters.
          </p>
        ) : null}
      </Container>
    </section>
  );
}
