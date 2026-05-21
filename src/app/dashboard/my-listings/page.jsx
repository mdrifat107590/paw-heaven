"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Modal from "../../../components/Modal";
import Spinner from "../../../components/Spinner";
import { useToast } from "../../../components/ToastProvider";
import { useAuth } from "../../providers";
import { formatDate } from "../../../lib/utils";
import { speciesOptions } from "../../../lib/mockData";
import { useRouter } from "next/navigation";
import {
  approveRequest,
  deletePet as deletePetApi,
  getOwnerPets,
  getOwnerRequests,
  rejectRequest,
  updatePet,
} from "../../../lib/api";

export default function MyListingsPage() {
  const { user, isLoading } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const [pets, setPets] = useState([]);
  const [requests, setRequests] = useState([]);
  const [activePet, setActivePet] = useState(null);
  const [editPet, setEditPet] = useState(null);
  const [petToDelete, setPetToDelete] = useState(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login?next=/dashboard/my-listings");
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    let isMounted = true;
    if (!user) return;

    Promise.all([getOwnerPets(), getOwnerRequests()])
      .then(([petsData, requestsData]) => {
        if (!isMounted) return;
        setPets(petsData.pets || []);
        setRequests(requestsData.requests || []);
      })
      .catch((error) => {
        if (!isMounted) return;
        addToast({ type: "error", message: error.message });
      });

    return () => {
      isMounted = false;
    };
  }, [user, addToast]);

  const stats = useMemo(() => {
    const total = pets.length;
    const available = pets.filter((pet) => pet.status !== "adopted").length;
    const adopted = pets.filter((pet) => pet.status === "adopted").length;
    return { total, available, adopted };
  }, [pets]);

  const handleApprove = (request) => {
    approveRequest(request._id)
      .then(() => {
        return Promise.all([getOwnerPets(), getOwnerRequests()]);
      })
      .then(([petsData, requestsData]) => {
        setPets(petsData.pets || []);
        setRequests(requestsData.requests || []);
        addToast({ type: "success", message: "Request approved." });
      })
      .catch((error) => {
        addToast({ type: "error", message: error.message });
      });
  };

  const handleReject = (request) => {
    rejectRequest(request._id)
      .then(() => getOwnerRequests())
      .then((data) => {
        setRequests(data.requests || []);
        addToast({ type: "info", message: "Request rejected." });
      })
      .catch((error) => {
        addToast({ type: "error", message: error.message });
      });
  };

  const handleDelete = () => {
    if (!petToDelete) return;
    const petId = petToDelete._id || petToDelete.id;
    if (!petId) return;

    deletePetApi(petId)
      .then(() => Promise.all([getOwnerPets(), getOwnerRequests()]))
      .then(([petsData, requestsData]) => {
        setPets(petsData.pets || []);
        setRequests(requestsData.requests || []);
        addToast({ type: "success", message: "Listing deleted." });
        setPetToDelete(null);
      })
      .catch((error) => {
        addToast({ type: "error", message: error.message });
      });
  };

  const handleEditSave = (event) => {
    event.preventDefault();
    if (!editPet) return;

    const petId = editPet._id || editPet.id;
    if (!petId) return;

    const payload = {
      name: editPet.name,
      species: editPet.species,
      breed: editPet.breed,
      age: editPet.age,
      gender: editPet.gender,
      image: editPet.image,
      healthStatus: editPet.healthStatus,
      vaccinationStatus: editPet.vaccinationStatus,
      location: editPet.location,
      fee: editPet.fee,
      description: editPet.description,
    };

    updatePet(petId, payload)
      .then((data) => {
        setPets((current) =>
          current.map((pet) =>
            pet._id === petId || pet.id === petId ? data.pet : pet
          )
        );
        setEditPet(null);
        addToast({ type: "success", message: "Listing updated." });
      })
      .catch((error) => {
        addToast({ type: "error", message: error.message });
      });
  };

  if (isLoading) return <Spinner label="Loading listings" />;
  if (!user) return null;

  const petRequests = requests.filter(
    (request) => String(request.petId) === String(activePet?._id)
  );

  return (
    <div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">My Listings</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your active pet listings and adoption requests.
          </p>
        </div>
        <Link
          href="/dashboard/add-pet"
          className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white"
        >
          Add New Pet
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Listings", value: stats.total },
          { label: "Available", value: stats.available },
          { label: "Adopted", value: stats.adopted },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              {item.label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {pets.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
            No listings yet. Add your first pet.
          </p>
        ) : null}
            {pets.map((pet) => (
          <div
            key={pet._id}
            className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-5 md:flex-row md:items-center md:justify-between"
          >
            <div className="flex gap-4">
              <div className="relative h-20 w-24 overflow-hidden rounded-2xl">
                <Image src={pet.image} alt={pet.name} fill className="object-cover" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {pet.name}
                </h3>
                <p className="text-sm text-slate-600">
                  {pet.species} · ৳{pet.fee} · {pet.status}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActivePet(pet)}
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700"
              >
                Requests
              </button>
              <button
                type="button"
                onClick={() => setEditPet(pet)}
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700"
              >
                Edit
              </button>
              <Link
                href={`/pets/${pet._id}`}
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700"
              >
                View
              </Link>
              <button
                type="button"
                onClick={() => setPetToDelete(pet)}
                className="rounded-full border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={Boolean(activePet)}
        title={`Requests for ${activePet?.name || ""}`}
        onClose={() => setActivePet(null)}
      >
        {petRequests.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            No requests yet.
          </p>
        ) : (
          <div className="space-y-4">
            {petRequests.map((request) => (
              <div
                key={request._id}
                className="rounded-2xl border border-slate-200 p-4"
              >
                <p className="text-sm font-semibold text-slate-900">
                  {request.userName}
                </p>
                <p className="text-xs text-slate-600">
                  {request.userEmail} · Pickup {formatDate(request.pickupDate)}
                </p>
                <p className="mt-2 text-sm text-slate-600">{request.message}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {request.status === "pending" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleApprove(request)}
                        className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReject(request)}
                        className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600"
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {request.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <Modal
        open={Boolean(editPet)}
        title={`Edit ${editPet?.name || ""}`}
        onClose={() => setEditPet(null)}
      >
        {editPet ? (
          <form onSubmit={handleEditSave} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">
                Pet Name
              </label>
              <input
                name="name"
                required
                value={editPet.name}
                onChange={(event) =>
                  setEditPet((prev) => ({ ...prev, name: event.target.value }))
                }
                className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">
                Species
              </label>
              <select
                value={editPet.species}
                onChange={(event) =>
                  setEditPet((prev) => ({
                    ...prev,
                    species: event.target.value,
                  }))
                }
                className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold"
              >
                {speciesOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">
                Breed
              </label>
              <input
                value={editPet.breed}
                onChange={(event) =>
                  setEditPet((prev) => ({ ...prev, breed: event.target.value }))
                }
                className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">
                Age
              </label>
              <input
                type="number"
                value={editPet.age}
                onChange={(event) =>
                  setEditPet((prev) => ({ ...prev, age: Number(event.target.value) }))
                }
                className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">
                Gender
              </label>
              <select
                value={editPet.gender}
                onChange={(event) =>
                  setEditPet((prev) => ({ ...prev, gender: event.target.value }))
                }
                className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold"
              >
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">
                Image URL
              </label>
              <input
                value={editPet.image}
                onChange={(event) =>
                  setEditPet((prev) => ({ ...prev, image: event.target.value }))
                }
                className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">
                Health Status
              </label>
              <input
                value={editPet.healthStatus}
                onChange={(event) =>
                  setEditPet((prev) => ({
                    ...prev,
                    healthStatus: event.target.value,
                  }))
                }
                className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">
                Vaccination Status
              </label>
              <input
                value={editPet.vaccinationStatus}
                onChange={(event) =>
                  setEditPet((prev) => ({
                    ...prev,
                    vaccinationStatus: event.target.value,
                  }))
                }
                className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">
                Location
              </label>
              <input
                value={editPet.location}
                onChange={(event) =>
                  setEditPet((prev) => ({ ...prev, location: event.target.value }))
                }
                className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">
                Adoption Fee
              </label>
              <input
                type="number"
                value={editPet.fee}
                onChange={(event) =>
                  setEditPet((prev) => ({ ...prev, fee: Number(event.target.value) }))
                }
                className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold uppercase text-slate-500">
                Description
              </label>
              <textarea
                rows={3}
                value={editPet.description}
                onChange={(event) =>
                  setEditPet((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditPet(null)}
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : null}
      </Modal>

      <Modal
        open={Boolean(petToDelete)}
        title={`Delete ${petToDelete?.name || ""}?`}
        onClose={() => setPetToDelete(null)}
      >
        <p className="text-sm text-slate-600">
          This will remove the listing and its requests. This action cannot be undone.
        </p>
        <div className="mt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setPetToDelete(null)}
            className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold text-white"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
