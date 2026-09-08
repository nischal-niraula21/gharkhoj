import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const useRooms = (filters = {}) =>
  useQuery({
    queryKey: ["rooms", filters],
    queryFn: async () => {
      const params = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "" && (!(Array.isArray(value)) || value.length)) {
          params[key] = Array.isArray(value) ? value.join(",") : value;
        }
      });
      const { data } = await api.get("/rooms", { params });
      return data.rooms || [];
    },
  });

export const useRoom = (id) =>
  useQuery({
    queryKey: ["room", id],
    queryFn: async () => (await api.get(`/rooms/${id}`)).data.room,
    enabled: Boolean(id),
  });

export const useOwnerRooms = (enabled = true) =>
  useQuery({
    queryKey: ["owner-rooms"],
    queryFn: async () => (await api.get("/rooms/owner/mine")).data.rooms || [],
    enabled,
  });
