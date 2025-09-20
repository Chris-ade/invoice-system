import { ReactNode } from "react";

export interface User {
  id: string;
  name: string;
}

export interface Response {
  success: boolean;
  message?: string;
  data?: object;
  errors?: object;
}

export interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  loginUser: ({
    name,
    password,
  }: {
    name: string;
    password: string;
  }) => Promise<void>;
  registerUser: ({
    name,
    password,
  }: {
    name: string;
    password: string;
  }) => Promise<void>;
  logoutUser: () => Promise<void>;
  refreshUser: () => void;
  api: (args: apiType) => Promise<Response>;
  loading: boolean;
  apiLoading: boolean;
}

export interface apiType {
  url: string;
  method?: string;
  data?: object;
}

export interface AuthProviderProps {
  children: ReactNode;
}

export type AuthenticatedUser = {
  id: string;
  name: string;
};

export type JWTPayload = {
  id: string;
  name: string;
  iat: number;
  exp: number;
};
