import { apiRequest } from "../api/client";

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
}

export function getCurrentUser() {
  return apiRequest<{ user: AuthUser }>("/auth/me");
}

export function registerAccount(input: {
  email: string;
  password: string;
  displayName: string;
}) {
  return apiRequest<{ user: AuthUser }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function loginAccount(input: { email: string; password: string }) {
  return apiRequest<{ user: AuthUser }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function logoutAccount() {
  return apiRequest<void>("/auth/logout", { method: "POST", body: "{}" });
}
