import { featuredPets } from "./mockData";

const STORAGE_KEYS = {
  pets: "pap_pets",
  requests: "pap_requests",
  users: "pap_users",
  auth: "pap_auth",
};

const safeParse = (value, fallback) => {
  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
};

export const getStoredPets = () => {
  if (typeof window === "undefined") {
    return featuredPets;
  }
  const stored = localStorage.getItem(STORAGE_KEYS.pets);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.pets, JSON.stringify(featuredPets));
    return featuredPets;
  }
  return safeParse(stored, featuredPets);
};

export const savePets = (pets) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.pets, JSON.stringify(pets));
};

export const getStoredRequests = () => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEYS.requests);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.requests, JSON.stringify([]));
    return [];
  }
  return safeParse(stored, []);
};

export const saveRequests = (requests) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.requests, JSON.stringify(requests));
};

export const getStoredUsers = () => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEYS.users);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify([]));
    return [];
  }
  return safeParse(stored, []);
};

export const saveUsers = (users) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
};

export const getStoredAuth = () => {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEYS.auth);
  if (!stored) return null;
  return safeParse(stored, null);
};

export const saveAuth = (auth) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.auth, JSON.stringify(auth));
};

export const clearAuth = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.auth);
};
