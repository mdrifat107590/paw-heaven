"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Container from "../components/Container";
import SectionTitle from "../components/SectionTitle";
import PetCard from "../components/PetCard";
import Spinner from "../components/Spinner";
import { getFeaturedPets } from "../lib/api";

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    getFeaturedPets(6)
      .then((data) => {
        if (!isMounted) return;
        setFeatured(data.pets || []);
      })
      .catch(() => {
        if (!isMounted) return;
        setFeatured([]);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return <Spinner label="Loading featured pets" />;
  }

  return (
    <div className="bg-slate-50">
      <section className="hero-gradient">
        <Container className="grid gap-8 py-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">
              Pet Adoption Platform
            </p>
            <h1 className="text-4xl font-semibold text-slate-900 md:text-5xl">
              Bring home a companion who changes everything.
            </h1>
            <p className="max-w-xl text-base text-slate-600">
              PawHaven connects caring families with rescued pets across Dhaka. Browse verified listings, send adoption requests, and manage your journey in one place.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/all-pets"
                className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white"
              >
                Adopt Now
              </Link>
              <Link
                href="/dashboard/add-pet"
                className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700"
              >
                Add a Pet
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Pets matched", value: "2.4k+" },
                { label: "Shelter partners", value: "18" },
                { label: "Avg. response", value: "12h" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl bg-white/70 p-4 shadow-sm">
                  <p className="text-lg font-semibold text-slate-900">
                    {item.value}
                  </p>
                  <p className="text-xs text-slate-600">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="glass-card">
              <h3 className="text-lg font-semibold text-slate-900">
                Adoption snapshot
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Verified vaccinations, caring shelters, and transparent fees make the adoption journey simple.
              </p>
              <div className="mt-5 space-y-3">
                {[
                  "Background-checked shelters",
                  "Real-time request tracking",
                  "No hidden adoption costs",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm text-slate-700">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="floating-card">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Today</p>
              <p className="text-lg font-semibold text-slate-900">8 new pets added</p>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white">
        <Container className="py-12">
          <SectionTitle
            eyebrow="Featured Pets"
            title="Ready for adoption"
            description="Meet a few of the pets waiting for a loving home today."
          />
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((pet) => (
              <PetCard key={pet._id || pet.id} pet={pet} />
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-slate-50">
        <Container className="py-12">
          <SectionTitle
            eyebrow="Why Adopt"
            title="Give a second chance"
            description="Adoption makes room for more rescues while giving pets the family they deserve."
          />
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Health screened",
                text: "Every listing includes verified health checks and vaccination status.",
              },
              {
                title: "Transparent fees",
                text: "Know exactly where your adoption fee goes with clear breakdowns.",
              },
              {
                title: "Lifelong support",
                text: "Access care tips, community events, and follow-up guidance.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-3xl border border-slate-200 bg-white p-6">
                <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-white">
        <Container className="py-12">
          <SectionTitle
            eyebrow="Success Stories"
            title="Families who found their match"
            description="Real journeys from adopters in our community."
          />
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {[
              {
                name: "Tariq and Daisy",
                text: "The dashboard helped us track every step. Daisy settled in within a week and loves her new backyard.",
              },
              {
                name: "Meera and Kiwi",
                text: "We adopted Kiwi after chatting with the shelter. The care tips made her transition smooth.",
              },
            ].map((story) => (
              <div key={story.name} className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="text-lg font-semibold text-slate-900">{story.name}</h3>
                <p className="mt-2 text-sm text-slate-600">{story.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-slate-50">
        <Container className="py-12">
          <SectionTitle
            eyebrow="Pet Care Tips"
            title="Prepare for day one"
            description="Practical steps to keep your new companion safe and happy."
          />
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              "Schedule a vet visit within the first week.",
              "Create a quiet space for rest and bonding.",
              "Use positive reinforcement during training.",
            ].map((tip) => (
              <div key={tip} className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
                {tip}
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-white">
        <Container className="py-12">
          <SectionTitle
            eyebrow="Community Events"
            title="Meet pets in person"
            description="Monthly meetups let you connect with shelters and learn from adopters."
          />
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              "Weekend adoption fairs in Gulshan.",
              "Volunteer orientation every first Friday.",
              "Pet wellness workshops with local vets.",
            ].map((event) => (
              <div key={event} className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                {event}
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-slate-50">
        <Container className="py-12">
          <SectionTitle
            eyebrow="Adoption Checklist"
            title="What to prepare"
            description="Get your home ready before welcoming a pet."
          />
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {[
              "Food bowls, fresh water, and a cozy bed.",
              "Secure windows and remove unsafe items.",
              "Plan your daily schedule for walks and play.",
              "Identify a trusted vet nearby.",
            ].map((item) => (
              <div key={item} className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
                {item}
              </div>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
