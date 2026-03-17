import { useSession } from "next-auth/react";

export const useCurrentUser = () => {
  const { data, status, update } = useSession();
  return {
    userData: data,
    status,
    update,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
  };
};