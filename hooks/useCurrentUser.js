import { data } from "autoprefixer";
import { useSession } from "next-auth/react";

export const useCurrentUser = () => {
  const { data } = useSession();
  return {
    userData: data ?? null,
  };
};
