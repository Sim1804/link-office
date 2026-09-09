import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  clearStoredToken,
  getStoredToken,
  login as loginApi,
  me,
  register as registerApi,
  MobileUser,
} from "@/services/auth";

import { getOnboardingStatus } from "@/services/onboarding";

type AuthStatus = {
  hasConsent: boolean;
  hasCompletedDemographics: boolean;
  hasCompletedIqrh: boolean;
};

type RegisterData = {
  prenom: string;
  nom: string;
  email: string;
  password: string;
  codeAccess?: string;
};

type AuthContextValue = {
  user: MobileUser | null;
  token: string | null;
  status: AuthStatus | null;
  loading: boolean;

  refresh: () => Promise<void>;

  login: (
    email: string,
    password: string
  ) => Promise<void>;

  register: (
    data: RegisterData
  ) => Promise<void>;

  logout: () => Promise<void>;
};

const AuthContext =
  createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] =
    useState<MobileUser | null>(null);

  const [token, setToken] =
    useState<string | null>(null);

  const [status, setStatus] =
    useState<AuthStatus | null>(null);

  const [loading, setLoading] =
    useState(true);

  const refresh = useCallback(async () => {
    const storedToken =
      await getStoredToken();

    if (!storedToken) {
      setToken(null);
      setUser(null);
      setStatus(null);
      return;
    }

    try {
      const result =
        await me(storedToken);

      setToken(storedToken);
      setUser(result.user);

      try {
        const onboarding =
          await getOnboardingStatus(
            storedToken
          );

        setStatus(onboarding);
      } catch (error) {
        console.error(
          "[AUTH ONBOARDING]",
          error
        );

        setStatus(null);
      }
    } catch (error) {
      console.error(
        "[AUTH REFRESH]",
        error
      );

      await clearStoredToken();

      setToken(null);
      setUser(null);
      setStatus(null);
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => {
      setLoading(false);
    });
  }, [refresh]);

  const login = useCallback(
    async (
      email: string,
      password: string
    ) => {
      const nextUser =
        await loginApi(
          email,
          password
        );

      const nextToken =
        await getStoredToken();

      if (!nextToken) {
        throw new Error(
          "La connexion a réussi mais aucun jeton de session n'a été enregistré."
        );
      }

      setUser(nextUser);
      setToken(nextToken);

      try {
        const onboarding =
          await getOnboardingStatus(
            nextToken
          );

        setStatus(onboarding);
      } catch (error) {
        console.error(
          "[LOGIN ONBOARDING]",
          error
        );

        setStatus(null);
      }
    },
    []
  );

  const register = useCallback(
    async (
      data: RegisterData
    ) => {
      const nextUser =
        await registerApi(data);

      const nextToken =
        await getStoredToken();

      if (!nextToken) {
        throw new Error(
          "Le compte a été créé mais aucun jeton de session n'a été enregistré."
        );
      }

      setUser(nextUser);
      setToken(nextToken);

      try {
        const onboarding =
          await getOnboardingStatus(
            nextToken
          );

        setStatus(onboarding);
      } catch (error) {
        console.error(
          "[REGISTER ONBOARDING]",
          error
        );

        setStatus(null);
      }
    },
    []
  );

  const logout = useCallback(
    async () => {
      await clearStoredToken();

      setToken(null);
      setUser(null);
      setStatus(null);
    },
    []
  );

  const value =
    useMemo<AuthContextValue>(
      () => ({
        user,
        token,
        status,
        loading,
        refresh,
        login,
        register,
        logout,
      }),
      [
        user,
        token,
        status,
        loading,
        refresh,
        login,
        register,
        logout,
      ]
    );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth doit être utilisé dans AuthProvider"
    );
  }

  return context;
}
