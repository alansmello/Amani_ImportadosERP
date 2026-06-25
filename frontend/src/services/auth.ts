import { apiClient } from "@/services/api-client";
import {
  clearStoredAuthSession,
  storeAuthSession
} from "@/services/auth-storage";
import type { LoginRequest, LoginResponse } from "@/types/auth";

export async function login(request: LoginRequest) {
  const session = await apiClient<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: request
  });

  storeAuthSession(session);
  return session;
}

export async function logout() {
  try {
    await apiClient<void>("/api/auth/logout", {
      method: "POST"
    });
  } catch {
    // Logout local continua mesmo se o evento de auditoria remoto falhar.
  }

  clearStoredAuthSession();
}
