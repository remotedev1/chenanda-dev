import { useSession } from "next-auth/react";

export const useCurrentUser = () => {
  const { data, status } = useSession();
  return { user: data, status };
};
