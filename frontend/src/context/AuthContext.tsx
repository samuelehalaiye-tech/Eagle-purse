import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { login as apiLogin, signup as apiSignup, getProfile } from "../services/api";

interface AuthContextValue {
  token: string | null;
  userId: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: {
    email: string;
    password: string;
    monthly_allowance: number;
    feeding_budget: number;
    dietary_pref?: string;
    allowance_period?: string;
    meals_per_day?: number;
    meal_times?: string[];
  }) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null
  );
  const [userId, setUserId] = useState<string | null>(() =>
    typeof window !== "undefined" ? localStorage.getItem("userId") : null
  );

  const login = async (email: string, password: string) => {
    const result = await apiLogin(email, password);
    if (!result?.access_token) {
      return false;
    }
    localStorage.setItem("authToken", result.access_token);
    localStorage.setItem("userId", result.user_id);
    setToken(result.access_token);
    setUserId(result.user_id);
    return true;
  };

  const signup = async (data: {
    email: string;
    password: string;
    monthly_allowance: number;
    feeding_budget: number;
    dietary_pref?: string;
    allowance_period?: string;
    meals_per_day?: number;
    meal_times?: string[];
  }) => {
    const result = await apiSignup(data);
    if (!result?.access_token) {
      return false;
    }
    localStorage.setItem("authToken", result.access_token);
    localStorage.setItem("userId", result.user_id);
    setToken(result.access_token);
    setUserId(result.user_id);
    return true;
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    setToken(null);
    setUserId(null);
  };

  // Validate the stored token on mount — if it's stale/expired, clear it
  useEffect(() => {
    if (token) {
      getProfile().then((result) => {
        if (!result) {
          // Token is invalid or user no longer exists on the backend
          logout();
        }
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const value = useMemo(
    () => ({ token, userId, login, signup, logout }),
    [token, userId]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
