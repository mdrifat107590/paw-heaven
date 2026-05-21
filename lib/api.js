import { createId } from "./utils";
import {
  clearAuth,
  getStoredAuth,
  getStoredPets,
  getStoredRequests,
  getStoredUsers,
  saveAuth,
  savePets,
  saveRequests,
  saveUsers,
} from "./storage";
import { sortByOption } from "./utils";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
const USE_LOCAL_API = !API_BASE;

const normalizePet = (pet) => {
  const id = pet._id || pet.id || createId("pet");
  return { ...pet, _id: String(id), id: String(id) };
};

const normalizeUser = (user) => {
  const id = user._id || user.id || createId("user");
  return { ...user, _id: String(id), id: String(id) };
};

const normalizeRequest = (request) => {
  const id = request._id || request.id || createId("req");
  return { ...request, _id: String(id), id: String(id) };
};

const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
};

const getCurrentUser = () => sanitizeUser(getStoredAuth());

const findPetById = (id) => {
  const pets = getStoredPets().map(normalizePet);
  return pets.find(
    (pet) => String(pet._id) === String(id) || String(pet.id) === String(id)
  );
};

const filterPets = ({ search, species, sort }) => {
  const allPets = getStoredPets().map(normalizePet);
  const lowerSearch = String(search || "").toLowerCase();

  const filtered = allPets.filter((pet) => {
    if (species && species !== "All" && pet.species !== species) return false;
    if (!lowerSearch) return true;
    return [pet.name, pet.breed, pet.species, pet.location]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(lowerSearch));
  });

  return sortByOption(filtered, sort);
};

const buildLocalResponse = (payload) => payload;

const localApi = {
  getFeaturedPets: (limit = 6) =>
    buildLocalResponse({ pets: filterPets({}).slice(0, limit) }),

  getPets: (params = {}) => buildLocalResponse({ pets: filterPets(params) }),

  getPetById: (id) => buildLocalResponse({ pet: findPetById(id) || null }),

  getOwnerPets: () => {
    const user = getCurrentUser();
    if (!user) return buildLocalResponse({ pets: [] });
    const pets = getStoredPets()
      .map(normalizePet)
      .filter((pet) => pet.ownerEmail === user.email);
    return buildLocalResponse({ pets });
  },

  createPet: (payload) => {
    const user = getCurrentUser();
    if (!user) throw new Error("You must be logged in to add a pet.");

    const pet = normalizePet({
      ...payload,
      _id: createId("pet"),
      ownerEmail: user.email,
      ownerName: user.name,
      status: "available",
      createdAt: new Date().toISOString(),
    });

    const pets = getStoredPets().map(normalizePet);
    savePets([...pets, pet]);
    return buildLocalResponse({ pet });
  },

  updatePet: (id, payload) => {
    const pets = getStoredPets().map(normalizePet);
    const petIndex = pets.findIndex(
      (pet) => String(pet._id) === String(id) || String(pet.id) === String(id)
    );
    if (petIndex === -1) throw new Error("Pet not found.");

    const updatedPet = normalizePet({ ...pets[petIndex], ...payload });
    pets[petIndex] = updatedPet;
    savePets(pets);
    return buildLocalResponse({ pet: updatedPet });
  },

  deletePet: (id) => {
    const pets = getStoredPets().map(normalizePet);
    const remainingPets = pets.filter(
      (pet) => String(pet._id) !== String(id) && String(pet.id) !== String(id)
    );
    savePets(remainingPets);

    const requests = getStoredRequests().map(normalizeRequest);
    const remainingRequests = requests.filter(
      (request) => String(request.petId) !== String(id)
    );
    saveRequests(remainingRequests);
    return buildLocalResponse({});
  },

  registerUser: (payload) => {
    const users = getStoredUsers().map(normalizeUser);
    const existingUser = users.find(
      (user) => user.email.toLowerCase() === payload.email.toLowerCase()
    );
    if (existingUser) {
      throw new Error("Email already registered.");
    }

    const newUser = normalizeUser({
      ...payload,
      _id: createId("user"),
      createdAt: new Date().toISOString(),
    });
    const savedUsers = [...users, newUser];
    saveUsers(savedUsers);
    saveAuth(sanitizeUser(newUser));
    return buildLocalResponse({ user: sanitizeUser(newUser) });
  },

  loginUser: (payload) => {
    const users = getStoredUsers().map(normalizeUser);
    const existingUser = users.find(
      (user) =>
        user.email.toLowerCase() === payload.email.toLowerCase() &&
        user.password === payload.password
    );

    if (!existingUser) {
      throw new Error("Invalid email or password.");
    }

    saveAuth(sanitizeUser(existingUser));
    return buildLocalResponse({ user: sanitizeUser(existingUser) });
  },

  logoutUser: () => {
    clearAuth();
    return buildLocalResponse({});
  },

  getMe: () => {
    const user = getCurrentUser();
    if (!user) throw new Error("Not logged in.");
    return buildLocalResponse({ user });
  },

  createRequest: (payload) => {
    const user = getCurrentUser();
    if (!user) throw new Error("You must be logged in to submit a request.");

    const pet = findPetById(payload.petId);
    if (!pet) throw new Error("Pet not found.");

    const request = normalizeRequest({
      ...payload,
      _id: createId("request"),
      petName: pet.name,
      userName: user.name,
      userEmail: user.email,
      createdAt: new Date().toISOString(),
      status: "pending",
    });

    const requests = [...getStoredRequests().map(normalizeRequest), request];
    saveRequests(requests);
    return buildLocalResponse({ request });
  },

  getMyRequests: () => {
    const user = getCurrentUser();
    if (!user) return buildLocalResponse({ requests: [] });
    const requests = getStoredRequests()
      .map(normalizeRequest)
      .filter((request) => request.userEmail === user.email);
    return buildLocalResponse({ requests });
  },

  getOwnerRequests: () => {
    const user = getCurrentUser();
    if (!user) return buildLocalResponse({ requests: [] });
    const requests = getStoredRequests()
      .map(normalizeRequest)
      .filter((request) => {
        const pet = findPetById(request.petId);
        return pet?.ownerEmail === user.email;
      });
    return buildLocalResponse({ requests });
  },

  approveRequest: (id) => {
    const requests = getStoredRequests().map(normalizeRequest);
    const requestIndex = requests.findIndex(
      (request) => String(request._id) === String(id) || String(request.id) === String(id)
    );
    if (requestIndex === -1) throw new Error("Request not found.");

    requests[requestIndex].status = "approved";
    saveRequests(requests);

    const pet = findPetById(requests[requestIndex].petId);
    if (pet) {
      const pets = getStoredPets().map(normalizePet);
      const petIndex = pets.findIndex(
        (p) => String(p._id) === String(pet._id)
      );
      if (petIndex !== -1) {
        pets[petIndex] = { ...pets[petIndex], status: "adopted" };
        savePets(pets);
      }
    }

    return buildLocalResponse({ request: requests[requestIndex] });
  },

  rejectRequest: (id) => {
    const requests = getStoredRequests().map(normalizeRequest);
    const requestIndex = requests.findIndex(
      (request) => String(request._id) === String(id) || String(request.id) === String(id)
    );
    if (requestIndex === -1) throw new Error("Request not found.");

    requests[requestIndex].status = "rejected";
    saveRequests(requests);
    return buildLocalResponse({ request: requests[requestIndex] });
  },

  cancelRequest: (id) => {
    const remainingRequests = getStoredRequests()
      .map(normalizeRequest)
      .filter(
        (request) => String(request._id) !== String(id) && String(request.id) !== String(id)
      );
    saveRequests(remainingRequests);
    return buildLocalResponse({});
  },
};

const buildQuery = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    query.set(key, value);
  });
  const result = query.toString();
  return result ? `?${result}` : "";
};

const isObjectLike = (value) => value !== null && typeof value === "object";

const unwrapPayload = (data, key) => {
  if (!isObjectLike(data)) return data;

  if (key && data[key] !== undefined) {
    return data[key];
  }

  if (isObjectLike(data.data)) {
    if (key && data.data[key] !== undefined) {
      return data.data[key];
    }
    if (data.data !== undefined) {
      return data.data;
    }
  }

  if (isObjectLike(data.result)) {
    if (key && data.result[key] !== undefined) {
      return data.result[key];
    }
    return data.result;
  }

  return data;
};

const apiRequest = async (path, options = {}) => {
  if (!API_BASE) {
    throw new Error("API base URL is not configured.");
  }

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      credentials: "include",
    });
  } catch (error) {
    const networkError = new Error("Network error");
    networkError.isNetworkError = true;
    throw networkError;
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
};

const remoteApi = {
  getFeaturedPets: async (limit = 6) => {
    const data = await apiRequest(`/pets/featured${buildQuery({ limit })}`);
    return { pets: unwrapPayload(data, "pets") || [] };
  },
  getPets: async (params = {}) => {
    const data = await apiRequest(`/pets${buildQuery(params)}`);
    return { pets: unwrapPayload(data, "pets") || [] };
  },
  getPetById: async (id) => {
    const data = await apiRequest(`/pets/${id}`);
    return { pet: unwrapPayload(data, "pet") || unwrapPayload(data) || null };
  },
  getOwnerPets: async () => {
    const data = await apiRequest("/pets/owner");
    return { pets: unwrapPayload(data, "pets") || [] };
  },
  createPet: async (payload) => {
    const data = await apiRequest("/pets", { method: "POST", body: JSON.stringify(payload) });
    return { pet: unwrapPayload(data, "pet") || unwrapPayload(data) };
  },
  updatePet: async (id, payload) => {
    const data = await apiRequest(`/pets/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
    return { pet: unwrapPayload(data, "pet") || unwrapPayload(data) };
  },
  deletePet: async (id) => {
    const data = await apiRequest(`/pets/${id}`, { method: "DELETE" });
    return unwrapPayload(data) || {};
  },
  registerUser: async (payload) => {
    const data = await apiRequest("/api/auth/sign-up/email", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return { user: unwrapPayload(data, "user") || unwrapPayload(data) };
  },
  loginUser: async (payload) => {
    const data = await apiRequest("/api/auth/sign-in/email", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return { user: unwrapPayload(data, "user") || unwrapPayload(data) };
  },
  logoutUser: async () => apiRequest("/api/auth/sign-out", { method: "POST" }),
  getMe: async () => {
    const data = await apiRequest("/users/me");
    return { user: unwrapPayload(data, "user") || unwrapPayload(data) || null };
  },
  createRequest: async (payload) => {
    const data = await apiRequest("/requests", { method: "POST", body: JSON.stringify(payload) });
    return { request: unwrapPayload(data, "request") || unwrapPayload(data) };
  },
  getMyRequests: async () => {
    const data = await apiRequest("/requests/my");
    return { requests: unwrapPayload(data, "requests") || [] };
  },
  getOwnerRequests: async () => {
    const data = await apiRequest("/requests/owner");
    return { requests: unwrapPayload(data, "requests") || [] };
  },
  approveRequest: async (id) => {
    const data = await apiRequest(`/requests/${id}/approve`, { method: "PATCH" });
    return { request: unwrapPayload(data, "request") || unwrapPayload(data) };
  },
  rejectRequest: async (id) => {
    const data = await apiRequest(`/requests/${id}/reject`, { method: "PATCH" });
    return { request: unwrapPayload(data, "request") || unwrapPayload(data) };
  },
  cancelRequest: async (id) => {
    const data = await apiRequest(`/requests/${id}`, { method: "DELETE" });
    return unwrapPayload(data) || {};
  },
};

const withLocalFallbackOnError = (remoteFn, localFn) => async (...args) => {
  if (USE_LOCAL_API) return localFn(...args);

  return remoteFn(...args);
};

const withLocalFallbackOnNetwork = (remoteFn, localFn) => async (...args) => {
  if (USE_LOCAL_API) return localFn(...args);

  return remoteFn(...args);
};

const api = {
  getFeaturedPets: withLocalFallbackOnError(remoteApi.getFeaturedPets, localApi.getFeaturedPets),
  getPets: withLocalFallbackOnError(remoteApi.getPets, localApi.getPets),
  getPetById: withLocalFallbackOnError(remoteApi.getPetById, localApi.getPetById),
  getOwnerPets: withLocalFallbackOnError(remoteApi.getOwnerPets, localApi.getOwnerPets),
  createPet: withLocalFallbackOnNetwork(remoteApi.createPet, localApi.createPet),
  updatePet: withLocalFallbackOnNetwork(remoteApi.updatePet, localApi.updatePet),
  deletePet: withLocalFallbackOnNetwork(remoteApi.deletePet, localApi.deletePet),
  registerUser: withLocalFallbackOnNetwork(remoteApi.registerUser, localApi.registerUser),
  loginUser: withLocalFallbackOnNetwork(remoteApi.loginUser, localApi.loginUser),
  logoutUser: withLocalFallbackOnNetwork(remoteApi.logoutUser, localApi.logoutUser),
  getMe: withLocalFallbackOnError(remoteApi.getMe, localApi.getMe),
  createRequest: withLocalFallbackOnNetwork(remoteApi.createRequest, localApi.createRequest),
  getMyRequests: withLocalFallbackOnError(remoteApi.getMyRequests, localApi.getMyRequests),
  getOwnerRequests: withLocalFallbackOnError(remoteApi.getOwnerRequests, localApi.getOwnerRequests),
  approveRequest: withLocalFallbackOnNetwork(remoteApi.approveRequest, localApi.approveRequest),
  rejectRequest: withLocalFallbackOnNetwork(remoteApi.rejectRequest, localApi.rejectRequest),
  cancelRequest: withLocalFallbackOnNetwork(remoteApi.cancelRequest, localApi.cancelRequest),
};

export const getFeaturedPets = (limit = 6) => api.getFeaturedPets(limit);
export const getPets = (params = {}) => api.getPets(params);
export const getPetById = (id) => api.getPetById(id);
export const getOwnerPets = () => api.getOwnerPets();
export const createPet = (payload) => api.createPet(payload);
export const updatePet = (id, payload) => api.updatePet(id, payload);
export const deletePet = (id) => api.deletePet(id);
export const registerUser = (payload) => api.registerUser(payload);
export const loginUser = (payload) => api.loginUser(payload);
export const logoutUser = () => api.logoutUser();
export const getMe = () => api.getMe();
export const createRequest = (payload) => api.createRequest(payload);
export const getMyRequests = () => api.getMyRequests();
export const getOwnerRequests = () => api.getOwnerRequests();
export const approveRequest = (id) => api.approveRequest(id);
export const rejectRequest = (id) => api.rejectRequest(id);
export const cancelRequest = (id) => api.cancelRequest(id);
