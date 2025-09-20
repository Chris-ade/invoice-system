"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import { useToast } from "@/hooks/use-toast";
import { apiClient, authClient } from "@/services/api";
import {
  AuthContextType,
  AuthProviderProps,
  apiType,
  User,
} from "@/types/auth";
import { useRouter } from "next/navigation";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiLoading, setApiLoading] = useState(false);
  const router = useRouter();
  const { toastSuccess, toastError } = useToast();

  const fetchUser = async () => {
    try {
      const res = await apiClient.get("/me");
      if (res.status === 200 && res.data.success) {
        setUser(res.data.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    const handleLogoutSync = (e: StorageEvent) => {
      if (e.key === "logout") {
        logoutUser(true, false, false);
      }
    };

    window.addEventListener("storage", handleLogoutSync);
    return () => {
      window.removeEventListener("storage", handleLogoutSync);
    };
  }, []);

  const refreshUser = () => {
    setLoading(true);
    fetchUser();
  };

  const loginUser = async ({
    name,
    password,
  }: {
    name: string;
    password: string;
  }) => {
    try {
      setApiLoading(true);
      const response = await authClient.post("/auth/login", {
        name,
        password,
      });

      if (response.status === 200 && response.data.success) {
        await fetchUser();
        setIsAuthenticated(true);
        toastSuccess(response.data.message);
        router.push("/dashboard");
      } else {
        toastError(response.data.message || "Login failed.");
      }
    } catch (error: any) {
      toastError(error?.response?.data?.message || "Login failed.");
    } finally {
      setApiLoading(false);
    }
  };

  const registerUser = async ({
    name,
    password,
  }: {
    name: string;
    password: string;
  }) => {
    try {
      setApiLoading(true);
      const response = await authClient.post("/auth/register", {
        name,
        password,
      });

      if (response.status === 201 && response.data.success) {
        toastSuccess(response.data.message);
        router.push("/auth/login");
      } else {
        toastError(response.data.message || "Registration failed.");
      }
    } catch (error: any) {
      toastError(error?.response?.data?.message || "Registration failed.");
    } finally {
      setApiLoading(false);
    }
  };

  const logoutUser = async (
    isPartial = false,
    showMsg = false,
    broadcast = true
  ): Promise<void> => {
    try {
      setApiLoading(true);
      await apiClient.post("/auth/logout");
      setUser(null);
      setIsAuthenticated(false);

      if (showMsg) {
        toastSuccess("You have been logged out successfully.");
      }

      // Only broadcast from the initiating tab
      if (broadcast && typeof window !== "undefined") {
        localStorage.setItem("logout", Date.now().toString());
      }

      if (!isPartial) {
        router.push("/auth/login");
      }
    } finally {
      setApiLoading(false);
    }
  };

  const api = async ({ url, method = "GET", data }: apiType) => {
    if (!url) throw new Error("API call attempted with undefined URL");

    try {
      const response = await apiClient({ url, method, data });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  };

  const contextData: AuthContextType = useMemo(
    () => ({
      user,
      setUser,
      isAuthenticated,
      setIsAuthenticated,
      loginUser,
      registerUser,
      logoutUser,
      refreshUser,
      fetchUser,
      api,
      loading,
      apiLoading,
    }),
    [user, isAuthenticated, loading, apiLoading]
  );

  return (
    <AuthContext.Provider value={contextData}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
