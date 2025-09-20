"use client";

import {
  useQuery,
  queryOptions,
  useMutation,
  UseQueryOptions,
} from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import { useToast } from "./use-toast";

interface UseApiOptions {
  method?: string;
  data?: object;
}

/**
 * useApiQuery - Hook for fetching data with auth context and toast on error.
 */
export const useApiQuery = <T = unknown,>(
  url: string | undefined,
  options: UseApiOptions = {},
  querySettings?: Partial<UseQueryOptions<T>>
) => {
  const { api } = useAuth();
  const { toastError } = useToast();

  const queryFn = async (): Promise<T> => {
    if (!url) throw new Error("useApiQuery: Missing URL");

    const response = await api({
      url,
      method: options.method ?? "GET",
      data: options.data,
    });

    if (!response || typeof response !== "object") {
      toastError("Unexpected response format.");
      return {} as T;
    }

    if ((response as any).success) {
      return (response as any).data as T;
    }

    toastError((response as any).data.message || "Failed to fetch data.");
    return {} as T;
  };

  return useQuery<T>({
    queryKey: [url, options.data],
    queryFn,
    enabled: !!url,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    ...querySettings,
  });
};

interface ApiMutationInput {
  url: string;
  method?: string;
  data?: object;
}

/**
 * useApiMutation - Hook for POST/PUT/DELETE requests with toast feedback.
 */
export const useApiMutation = <T = unknown,>() => {
  const { api } = useAuth();
  const { toastError, toastSuccess } = useToast();

  const mutationFn = async ({
    url,
    method = "POST",
    data,
  }: ApiMutationInput): Promise<T | undefined> => {
    try {
      const response = await api({ url, method, data });

      if (!response || typeof response !== "object") {
        toastError("Unexpected response format.");
        return;
      }

      if (response.success) {
        toastSuccess(response.message || "Data saved.");
        return response.data as T;
      } else {
        toastError(response.message || "Failed to save data.");
        return;
      }
    } catch (error: any) {
      toastError(error.message || "An unexpected error occurred.");
      throw error;
    }
  };

  return useMutation({
    mutationFn,
    retry: 0,
  });
};
