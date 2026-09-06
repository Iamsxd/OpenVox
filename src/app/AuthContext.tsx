import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ApiError } from "../core/api/client";
import {
  getCurrentUser,
  loginAccount,
  logoutAccount,
  registerAccount,
  type AuthUser,
} from "../core/auth/authApi";
import { TRAINING_CHANGED_EVENT } from "../core/storage/database";
import { syncTrainingData } from "../core/sync/trainingSync";

export type AuthStatus = "loading" | "guest" | "authenticated";
export type SyncStatus = "idle" | "syncing" | "synced" | "offline" | "error";

interface AuthContextValue {
  user: AuthUser | null;
  authStatus: AuthStatus;
  syncStatus: SyncStatus;
  lastSyncAt: number | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    displayName: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  syncNow: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [lastSyncAt, setLastSyncAt] = useState<number | null>(null);
  const syncing = useRef<Promise<void> | null>(null);

  useEffect(() => {
    let active = true;
    void getCurrentUser()
      .then(({ user: current }) => {
        if (!active) return;
        setUser(current);
        setAuthStatus("authenticated");
      })
      .catch(() => {
        if (!active) return;
        setUser(null);
        setAuthStatus("guest");
      });
    return () => {
      active = false;
    };
  }, []);

  const syncNow = useCallback(async () => {
    if (!user) return;
    if (syncing.current) return syncing.current;
    const operation = (async () => {
      setSyncStatus("syncing");
      try {
        const result = await syncTrainingData(user.id);
        setLastSyncAt(result.syncedAt);
        setSyncStatus("synced");
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          setUser(null);
          setAuthStatus("guest");
          setSyncStatus("idle");
          return;
        }
        setSyncStatus(navigator.onLine ? "error" : "offline");
        throw error;
      } finally {
        syncing.current = null;
      }
    })();
    syncing.current = operation;
    return operation;
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let debounceTimer: number | undefined;
    const requestSync = () => {
      window.clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(
        () => void syncNow().catch(() => undefined),
        900,
      );
    };
    const interval = window.setInterval(requestSync, 60_000);
    window.addEventListener("online", requestSync);
    window.addEventListener(TRAINING_CHANGED_EVENT, requestSync);
    requestSync();
    return () => {
      window.clearTimeout(debounceTimer);
      window.clearInterval(interval);
      window.removeEventListener("online", requestSync);
      window.removeEventListener(TRAINING_CHANGED_EVENT, requestSync);
    };
  }, [user, syncNow]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      authStatus,
      syncStatus,
      lastSyncAt,
      async login(email, password) {
        const result = await loginAccount({ email, password });
        setUser(result.user);
        setAuthStatus("authenticated");
      },
      async register(displayName, email, password) {
        const result = await registerAccount({ displayName, email, password });
        setUser(result.user);
        setAuthStatus("authenticated");
      },
      async logout() {
        try {
          await logoutAccount();
        } finally {
          setUser(null);
          setAuthStatus("guest");
          setSyncStatus("idle");
          setLastSyncAt(null);
        }
      },
      syncNow,
    }),
    [user, authStatus, syncStatus, lastSyncAt, syncNow],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider.");
  return context;
}
