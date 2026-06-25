"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";

import { routes } from "@/config/routes";
import {
  clearStoredAuthSession,
  getStoredAuthSession,
  isAuthSessionExpired
} from "@/services/auth-storage";
import { login as loginRequest, logout as logoutRequest } from "@/services/auth";
import type { AuthSession, LoginRequest } from "@/types/auth";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  session: AuthSession | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  login: (request: LoginRequest) => Promise<AuthSession>;
  logout: () => Promise<void>;
  loginRoute: string;
};

type AuthProviderProps = {
  children: ReactNode;
  onSessionCleared?: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children, onSessionCleared }: AuthProviderProps) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    const storedSession = getStoredAuthSession();

    if (!storedSession || isAuthSessionExpired(storedSession)) {
      clearStoredAuthSession();
      onSessionCleared?.();
      setSession(null);
      setStatus("unauthenticated");
      return;
    }

    setSession(storedSession);
    setStatus("authenticated");
  }, [onSessionCleared]);

  useEffect(() => {
    function handleSessionCleared() {
      onSessionCleared?.();
      setSession(null);
      setStatus("unauthenticated");
    }

    window.addEventListener("amani-auth-session-cleared", handleSessionCleared);

    return () => {
      window.removeEventListener("amani-auth-session-cleared", handleSessionCleared);
    };
  }, [onSessionCleared]);

  const login = useCallback(async (request: LoginRequest) => {
    const authenticatedSession = await loginRequest(request);
    setSession(authenticatedSession);
    setStatus("authenticated");
    return authenticatedSession;
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    onSessionCleared?.();
    setSession(null);
    setStatus("unauthenticated");
  }, [onSessionCleared]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      status,
      isAuthenticated: status === "authenticated",
      login,
      logout,
      loginRoute: routes.login
    }),
    [login, logout, session, status]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }

  return context;
}
