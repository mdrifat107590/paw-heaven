"use client";

import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Container from "../../../components/Container";
import Spinner from "../../../components/Spinner";
import { useToast } from "../../../components/ToastProvider";
import { useAuth } from "../../providers";
import { formatDate } from "../../../lib/utils";
import { featuredPets } from "../../../lib/mockData";
import { createRequest, getPetById } from "../../../lib/api";

export default function PetDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const petId = params?.id;
  const { user, isLoading } = useAuth();
  const { addToast } = useToast();
  const [pickupDate, setPickupDate] = useState("");
  const [message, setMessage] = useState("");
  const [pet, setPet] = useState(null);
  const [isPetLoading, setIsPetLoading] = useState(true);
  const petIdString = String(petId || "");
  const isOwner = Boolean(user?.email && pet?.ownerEmail === user.email);
  const isAdopted = pet?.status === "adopted";
  const canRequestAdoption = Boolean(user && pet && !isOwner && !isAdopted);

  useEffect(() => {
    let isMounted = true;

    const loadPet = async () => {
      if (!isMounted || !petId) return;
      setIsPetLoading(true);

      const fallbackPet = featuredPets.find(
        (item) => item.id === petId || item._id === petId
      );

      try {
        const data = await getPetById(petId);
        if (!isMounted) return;
        if (data.pet) {
          setPet(data.pet);
        } else if (fallbackPet) {
          setPet({ ...fallbackPet, _id: fallbackPet.id });
        } else {
          setPet(null);
        }
      } catch {
        if (!isMounted) return;
        if (fallbackPet) {
          setPet({ ...fallbackPet, _id: fallbackPet.id });
        } else {
          setPet(null);
        }
      } finally {
        if (!isMounted) return;
        setIsPetLoading(false);
      }
    };

    loadPet();

    return () => {
      isMounted = false;
    };
  }, [petId]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(`/login?next=/pets/${petIdString}`);
    }
  }, [isLoading, user, router, petIdString]);

  if (isLoading || isPetLoading) return <Spinner label="Loading pet details" />;
  if (!pet) {
    return (
      <Container className="py-16">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">
            Pet not found
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            The pet you are looking for is not available anymore.
          </p>
          <button
            type="button"
            onClick={() => router.push("/all-pets")}
            className="mt-4 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white"
          >
            Back to All Pets
          </button>
        </div>
      </Container>
    );
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canRequestAdoption) {
      addToast({
        type: "error",
        message: isOwner
          ? "You cannot adopt your own pet."
          : "This pet is already adopted.",
      });
      return;
    }
    createRequest({
      petId: pet._id || pet.id,
      pickupDate,
      message,
    })
      .then(() => {
        setPickupDate("");
        setMessage("");
        addToast({ type: "success", message: "Request submitted." });
      })
      .catch((error) => {
        addToast({ type: "error", message: error.message });
      });
  };

  return (
    <section className="bg-slate-50">
      <Container className="grid gap-10 py-12 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <div className="relative h-80 w-full overflow-hidden rounded-3xl">
            <Image src={pet.image} alt={pet.name} fill className="object-cover" />
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-semibold text-slate-900">
                {pet.name}
              </h1>
              <span className="rounded-full bg-amber-100 px-4 py-1 text-sm font-semibold text-amber-700">
                {pet.status === "adopted" ? "Adopted" : "Available"}
              </span>
            </div>
            <p className="mt-2 text-slate-600">
              {pet.breed} · {pet.age} yrs · {pet.gender}
            </p>
            <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Species
                </p>
                <p>{pet.species}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Breed
                </p>
                <p>{pet.breed}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Age
                </p>
                <p>{pet.age} yrs</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Gender
                </p>
                <p>{pet.gender}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Health Status
                </p>
                <p>{pet.healthStatus}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Vaccination Status
                </p>
                <p>{pet.vaccinationStatus}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Location
                </p>
                <p>{pet.location}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Adoption Fee
                </p>
                <p>৳{pet.fee}</p>
              </div>
            </div>
            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-lg font-semibold text-slate-900">Description</h2>
              <p className="mt-3 text-sm text-slate-600">{pet.description}</p>
            </div>
            {pet.ownerName || pet.ownerEmail ? (
              <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <h2 className="text-lg font-semibold text-slate-900">Owner Info</h2>
                <div className="mt-3 text-sm text-slate-600 space-y-2">
                  {pet.ownerName ? (
                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-500">Owner</p>
                      <p>{pet.ownerName}</p>
                    </div>
                  ) : null}
                  {pet.ownerEmail ? (
                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-500">Email</p>
                      <p>{pet.ownerEmail}</p>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-slate-900">
            Adoption Request
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            We will review your request within 24 hours.
          </p>
          {!canRequestAdoption ? (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              {isOwner
                ? "You manage this listing, so you cannot submit an adoption request for it."
                : "This pet has already been adopted, so requests are closed."}
            </div>
          ) : null}
          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">
                Pet Name
              </label>
              <input
                value={pet.name}
                readOnly
                className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 text-sm font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">
                Your Name
              </label>
              <input
                value={user?.name || ""}
                readOnly
                className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 text-sm font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">
                Your Email
              </label>
              <input
                value={user?.email || ""}
                readOnly
                className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 text-sm font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">
                Pickup Date
              </label>
              <input
                type="date"
                value={pickupDate}
                onChange={(event) => setPickupDate(event.target.value)}
                required
                className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">
                Message
              </label>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                required
                rows={3}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold"
                placeholder="Tell us about your home setup."
              />
            </div>
            <div className="text-xs text-slate-500">
              Request created: {formatDate(new Date().toISOString())}
            </div>
            <button
              type="submit"
              disabled={!canRequestAdoption}
              className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {canRequestAdoption ? "Adopt Now" : "Request Closed"}
            </button>
          </form>
        </div>
      </Container>
    </section>
  );
}
