import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../context/auth-context";
import { useToast } from "./use-toast";

interface ApiMutationInput {
  url: string;
  method?: string;
  data?: object;
}

const useApiMutation = () => {
  const { api } = useAuth();
  const { toastError, toastSuccess } = useToast();

  // Mutation function
  const mutationFn = async ({
    url,
    method = "POST",
    data,
  }: ApiMutationInput) => {
    try {
      const response = await api({ url, method, data });

      if (response && response.success) {
        toastSuccess(response.message || "Data saved.");
        return response.data; // Resolve with data
      } else {
        const error = new Error(response?.message || "Failed to save data.");
        (error as any).errors = response.errors; // Attach validation errors
        toastError(response?.message || "Failed to save data.");
        throw error; // Throw for React Query to catch
      }
    } catch (error: any) {
      toastError(error.message || "An unexpected error occurred.");
      throw error; // Throw error for React Query to handle
    }
  };

  // Mutation
  const mutation = useMutation({
    mutationFn: mutationFn,
    retry: 0,
    onError: (error: any) => {
      throw error;
    },
    onSuccess: (data: any) => {
      console.log("Mutation success:", data);
    },
  });

  return mutation;
};

export default useApiMutation;
