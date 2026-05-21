"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ToastProvider } from "../components/ToastProvider";
import { getMe, loginUser, logoutUser, registerUser } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getMe()
      .then((data) => {
        if (!isMounted) return;
        setUser(data.user || null);
      })
      .catch(() => {
        if (!isMounted) return;
        setUser(null);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async ({ email, password }) => {
    try {
      const data = await loginUser({ email, password });
      setUser(data.user);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }, []);

  const register = useCallback(async (payload) => {
    try {
      const data = await registerUser(payload);
      setUser(data.user);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, login, register, logout }),
    [user, isLoading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export default function Providers({ children }) {
  return (
    <ToastProvider>
      <AuthProvider>{children}</AuthProvider>
    </ToastProvider>
  );
}
