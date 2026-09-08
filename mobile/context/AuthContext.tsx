import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { clearStoredToken, getStoredToken, login as loginApi, me, register as registerApi, MobileUser } from "@/services/auth";
import { getOnboardingStatus } from "@/services/onboarding";

type AuthContextValue = {
  user: MobileUser | null;
  token: string | null;
  status: { hasConsent: boolean; hasCompletedDemographics: boolean; hasCompletedIqrh: boolean } | null;
  loading: boolean;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { prenom: string; nom: string; email: string; password: string; codeAccess?: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MobileUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthContextValue["status"]>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const stored = await getStoredToken();
    if (!stored) {
      setToken(null); setUser(null); setStatus(null); return;
    }
    try {
      const result = await me(stored);
      setToken(stored); setUser(result.user);
      const onboarding = await getOnboardingStatus(stored);
      setStatus(onboarding);
    } catch {
      await clearStoredToken();
      setToken(null); setUser(null); setStatus(null);
    }
  }, []);

  useEffect(() => { refresh().finally(() => setLoading(false)); }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const nextUser = await loginApi(email, password);
    const nextToken = await getStoredToken();
    setUser(nextUser); setToken(nextToken);
    if (nextToken) setStatus(await getOnboardingStatus(nextToken));
  }, []);

  const register = useCallback(async (data: { prenom: string; nom: string; email: string; password: string; codeAccess?: string }) => {
    const nextUser = await registerApi(data);
    const nextToken = await getStoredToken();
    setUser(nextUser); setToken(nextToken);
    if (nextToken) setStatus(await getOnboardingStatus(nextToken));
  }, []);

  const logout = useCallback(async () => {
    await clearStoredToken(); setToken(null); setUser(null); setStatus(null);
  }, []);

  const value = useMemo(() => ({ user, token, status, loading, refresh, login, register, logout }), [user, token, status, loading, refresh, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth doit être utilisé dans AuthProvider");
  return value;
}
