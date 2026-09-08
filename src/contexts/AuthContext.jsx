import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

const AuthContext = createContext({
  owner: null,
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  verifyEmail: async () => {},
  refreshOwner: async () => {},
  signOut: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshOwner = async () => {
    const token = localStorage.getItem("gharkhoj-owner-token");
    if (!token) {
      setOwner(null);
      setLoading(false);
      return null;
    }
    try {
      const { data } = await api.get("/auth/me");
      setOwner(data.owner);
      return data.owner;
    } catch {
      localStorage.removeItem("gharkhoj-owner-token");
      setOwner(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refreshOwner(); }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("gharkhoj-owner-token", data.token);
    setOwner(data.owner);
    return data;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    return data;
  };

  const verifyEmail = async (email, code) => {
    const { data } = await api.post("/auth/verify-email", { email, code });
    localStorage.setItem("gharkhoj-owner-token", data.token);
    setOwner(data.owner);
    return data;
  };

  const signOut = () => {
    localStorage.removeItem("gharkhoj-owner-token");
    setOwner(null);
  };

  const value = useMemo(() => ({ owner, user: owner, loading, login, register, verifyEmail, refreshOwner, signOut }), [owner, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
