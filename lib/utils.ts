import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getActionStates(status: string) {
  const isApproved = status === "approved";
  const isRejected = status === "rejected";
  const isPending = status === "pending";

  return {
    canApprove: isPending || isRejected,
    canReject: isPending || isApproved,
    isApproved,
    isRejected,
    isPending,
  };
}
