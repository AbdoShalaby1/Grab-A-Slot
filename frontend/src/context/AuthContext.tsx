import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import * as api from "../api/client";
import type { User } from "../types";

const STORAGE_TOKEN = "ab_token";
const STORAGE_USER = "ab_user";

type AuthState = {
  user: User | null;
  token: string | null;
  loading: boolean;
};

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readStored(): { user: User | null; token: string | null } {
  try {
    const token = localStorage.getItem(STORAGE_TOKEN);
    const raw = localStorage.getItem(STORAGE_USER);
    const user = raw ? (JSON.parse(raw) as User) : null;
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [{ user, token, loading }, setState] = useState<AuthState>(() => {
    const { token: t, user: u } = readStored();
    api.setBearerToken(t);
    return { user: u, token: t, loading: false };
  });

  const persist = useCallback((u: User | null, t: string | null) => {
    api.setBearerToken(t);
    if (t) localStorage.setItem(STORAGE_TOKEN, t);
    else localStorage.removeItem(STORAGE_TOKEN);
    if (u) localStorage.setItem(STORAGE_USER, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_USER);
    setState((s) => ({ ...s, user: u, token: t, loading: false }));
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const { user: u, token: t } = await api.login(email, password);
      persist(u, t);
    },
    [persist]
  );

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      const { user: u, token: t } = await api.register(email, password, name);
      persist(u, t);
    },
    [persist]
  );

  const logout = useCallback(() => {
    persist(null, null);
  }, [persist]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
    }),
    [user, token, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
