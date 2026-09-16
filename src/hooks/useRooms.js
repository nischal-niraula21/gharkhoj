import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const ROOM_CACHE_PREFIX = "gharkhoj-public-rooms:";
const ROOM_CACHE_TTL = 6 * 60 * 60 * 1000;

const normalizeFilters = (filters = {}) => {
  const normalized = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (
      value === undefined ||
      value === null ||
      value === "" ||
      (Array.isArray(value) && value.length === 0)
    ) {
      return;
    }

    if (key === "sort" && value === "newest") return;

    normalized[key] = Array.isArray(value)
      ? [...value].sort()
      : value;
  });

  return normalized;
};

const cacheKeyFor = (filters) =>
  `${ROOM_CACHE_PREFIX}${JSON.stringify(filters)}`;

const readCachedRooms = (filters) => {
  try {
    const raw = localStorage.getItem(cacheKeyFor(filters));
    if (!raw) return undefined;

    const cached = JSON.parse(raw);
    if (!Array.isArray(cached.rooms)) return undefined;

    if (Date.now() - cached.savedAt > ROOM_CACHE_TTL) {
      localStorage.removeItem(cacheKeyFor(filters));
      return undefined;
    }

    return cached.rooms;
  } catch {
    return undefined;
  }
};

const writeCachedRooms = (filters, rooms) => {
  try {
    localStorage.setItem(
      cacheKeyFor(filters),
      JSON.stringify({ rooms, savedAt: Date.now() }),
    );
  } catch {
    // Storage can be unavailable or full. The network result still works.
  }
};

export const useRooms = (filters = {}) => {
  const normalizedFilters = normalizeFilters(filters);

  return useQuery({
    queryKey: ["rooms", normalizedFilters],
    queryFn: async () => {
      const params = {};

      Object.entries(normalizedFilters).forEach(([key, value]) => {
        params[key] = Array.isArray(value) ? value.join(",") : value;
      });

      const { data } = await api.get("/rooms", { params });
      const rooms = data.rooms || [];

      writeCachedRooms(normalizedFilters, rooms);
      return rooms;
    },
    initialData: () => readCachedRooms(normalizedFilters),
    // Cached rooms render immediately, but React Query still refreshes them.
    initialDataUpdatedAt: 0,
    staleTime: 5 * 60 * 1000,
  });
};

export const useRoom = (id) =>
  useQuery({
    queryKey: ["room", id],
    queryFn: async () => (await api.get(`/rooms/${id}`)).data.room,
    enabled: Boolean(id),
  });

export const useOwnerRooms = (enabled = true) =>
  useQuery({
    queryKey: ["owner-rooms"],
    queryFn: async () =>
      (await api.get("/rooms/owner/mine")).data.rooms || [],
    enabled,
  });
