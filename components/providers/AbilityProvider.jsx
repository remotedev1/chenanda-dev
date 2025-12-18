"use client";

import { createContext, useContext, useMemo } from "react";
import { useSession } from "next-auth/react";
import { createContextualCan } from "@casl/react";
import { createMongoAbility } from "@casl/ability";
import { defineAbilityFor } from "@/lib/ability/defineAbility";

export const AbilityContext = createContext(createMongoAbility());

export const Can = createContextualCan(AbilityContext.Consumer);

export function AbilityProvider({ children }) {
  const { data: session, status } = useSession();

  const ability = useMemo(() => {
    if (status === "loading") return createMongoAbility();

    return session?.user
      ? defineAbilityFor(session)
      : defineAbilityFor({ role: "USER" });
  }, [session, status]);

  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  );
}

export function useAbilityContext() {
  const ability = useContext(AbilityContext);
  if (!ability) {
    throw new Error("useAbilityContext must be used within AbilityProvider");
  }
  return ability;
}
