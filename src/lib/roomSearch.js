export const buildRoomSearchUrl = ({
  location = "",
  maxRent = "",
  roomType = "",
} = {}) => {
  const params = new URLSearchParams();

  if (location.trim()) {
    params.set("location", location.trim());
  }

  if (maxRent !== "") {
    params.set("maxRent", maxRent);
  }

  if (roomType) {
    params.set("roomType", roomType);
  }

  const query = params.toString();
  return query ? `/search?${query}` : "/search";
};

export const readRoomSearchParams = (searchParams) => ({
  location: searchParams.get("location")?.trim() || "",
  // Keep maxPrice as a fallback so older shared/bookmarked URLs still work.
  maxRent:
    searchParams.get("maxRent") ||
    searchParams.get("maxPrice") ||
    "",
  roomType: searchParams.get("roomType") || "",
});
