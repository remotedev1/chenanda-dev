import { useSession } from "next-auth/react";

export const useCurrentUser = () => {
  const { data:{user}, status } = useSession();
  return {
    user: user ?? null,
    status,
  };
};
