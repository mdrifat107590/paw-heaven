"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../../../components/ToastProvider";
import { useAuth } from "../../providers";
import { speciesOptions } from "../../../lib/mockData";
import { createPet } from "../../../lib/api";
import Spinner from "../../../components/Spinner";

const initialForm = {
  name: "",
  species: "Dog",
  breed: "",
  age: "",
  gender: "Male",
  image: "",
  healthStatus: "Healthy",
  vaccinationStatus: "Up to date",
  location: "",
  fee: "",
  description: "",
};

export default function AddPetPage() {
  const { user, isLoading } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login?next=/dashboard/add-pet");
    }
  }, [isLoading, user, router]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!user) return;
    // simple image URL validation to avoid next/image runtime errors
    const allowedHosts = [
      "images.unsplash.com",
      "i.pravatar.cc",
      "encrypted-tbn0.gstatic.com",
      "i.ibb.co",
      "i.postimg.cc",
      "postimg.cc",
    ];

    const isValidImageUrl = (url) => {
      try {
        const u = new URL(url);
        return (
          (u.protocol === "http:" || u.protocol === "https:") &&
          allowedHosts.includes(u.hostname)
        );
      } catch (e) {
        return false;
      }
    };

    if (!isValidImageUrl(form.image)) {
      addToast({ type: "error", message: "Invalid image URL or host. Use a full https URL from a supported host." });
      return;
    }

    createPet({
      ...form,
      age: Number(form.age),
      fee: Number(form.fee),
    })
      .then(() => {
        addToast({ type: "success", message: "Pet added." });
        router.push("/dashboard/my-listings");
      })
      .catch((error) => {
        addToast({ type: "error", message: error.message });
      });
  };

  if (isLoading) return <Spinner label="Loading" />;
  if (!user) return null;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Add Pet</h1>
      <p className="mt-2 text-sm text-slate-500">
        Add a new pet listing with all adoption details.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase text-slate-500">
            Pet Name
          </label>
          <input
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase text-slate-500">
            Species
          </label>
          <select
            name="species"
            value={form.species}
            onChange={handleChange}
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
            name="breed"
            required
            value={form.breed}
            onChange={handleChange}
            className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase text-slate-500">
            Age (Years)
          </label>
          <input
            type="number"
            name="age"
            required
            value={form.age}
            onChange={handleChange}
            className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase text-slate-500">
            Gender
          </label>
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
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
            name="image"
            required
            value={form.image}
            onChange={handleChange}
            placeholder="https://"
            className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase text-slate-500">
            Health Status
          </label>
          <input
            name="healthStatus"
            required
            value={form.healthStatus}
            onChange={handleChange}
            className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase text-slate-500">
            Vaccination Status
          </label>
          <input
            name="vaccinationStatus"
            required
            value={form.vaccinationStatus}
            onChange={handleChange}
            className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase text-slate-500">
            Location
          </label>
          <input
            name="location"
            required
            value={form.location}
            onChange={handleChange}
            className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase text-slate-500">
            Adoption Fee
          </label>
          <input
            type="number"
            name="fee"
            required
            value={form.fee}
            onChange={handleChange}
            className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold"
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs font-semibold uppercase text-slate-500">
            Description
          </label>
          <textarea
            name="description"
            required
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase text-slate-500">
            Owner Email
          </label>
          <input
            readOnly
            value={user.email}
            className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 text-sm font-semibold"
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
          >
            Save Pet
          </button>
        </div>
      </form>
    </div>
  );
}
