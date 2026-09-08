import { createContext, useCallback, useContext, useEffect, useState } from "react";
const STORAGE_KEY = "gharkhoj-favorites";
const FavoritesContext = createContext(undefined);
const read = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
    }
    catch {
        return [];
    }
};
export const FavoritesProvider = ({ children }) => {
    const [favorites, setFavorites] = useState(() => read());
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
        }
        catch {
            /* ignore */
        }
    }, [favorites]);
    const toggleFavorite = useCallback((id) => {
        setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [id, ...prev]));
    }, []);
    const isFavorite = useCallback((id) => favorites.includes(id), [favorites]);
    return (<FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>);
};
export const useFavorites = () => {
    const ctx = useContext(FavoritesContext);
    if (!ctx)
        throw new Error("useFavorites must be used within FavoritesProvider");
    return ctx;
};
