"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Spinner from "../../../components/Spinner";
import { useToast } from "../../../components/ToastProvider";
import { useAuth } from "../../providers";
import { formatDate } from "../../../lib/utils";
import { useRouter } from "next/navigation";
import { cancelRequest, getMyRequests } from "../../../lib/api";

export default function MyRequestsPage() {
  const { user, isLoading } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login?next=/dashboard/my-requests");
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    let isMounted = true;
    if (!user) return;
    getMyRequests()
      .then((data) => {
        if (!isMounted) return;
        setRequests(data.requests || []);
      })
      .catch((error) => {
        if (!isMounted) return;
        addToast({ type: "error", message: error.message });
      });

    return () => {
      isMounted = false;
    };
  }, [user, addToast]);

  const handleCancel = (id) => {
    cancelRequest(id)
      .then(() => getMyRequests())
      .then((data) => {
        setRequests(data.requests || []);
        addToast({ type: "success", message: "Request cancelled." });
      })
      .catch((error) => {
        addToast({ type: "error", message: error.message });
      });
  };

  if (isLoading) return <Spinner label="Loading requests" />;
  if (!user) return null;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">My Requests</h1>
      <p className="mt-2 text-sm text-slate-500">
        Track your adoption requests and their status.
      </p>

      <div className="mt-6 space-y-4">
        {requests.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
            No requests yet. Browse pets to send your first request.
          </p>
        ) : null}
        {requests.map((request) => (
          <div
            key={request._id}
            className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                {request.petName}
              </h3>
              <p className="text-sm text-slate-600">
                Request Date: {formatDate(request.createdAt)} · Pickup: {formatDate(request.pickupDate)}
              </p>
              <span
                className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  request.status === "approved"
                    ? "bg-emerald-100 text-emerald-700"
                    : request.status === "rejected"
                    ? "bg-rose-100 text-rose-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {request.status}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/pets/${request.petId}`}
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700"
              >
                View
              </Link>
              <button
                type="button"
                onClick={() => handleCancel(request._id)}
                className="rounded-full border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-600"
              >
                Cancel
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
