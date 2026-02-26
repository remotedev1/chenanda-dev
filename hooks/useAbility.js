"use client";

import { createContext, useContext, useMemo } from "react";
import { defineAbilityFor } from "@/lib/ability";
import { useCurrentUser } from "./useCurrentUser";

const AbilityContext = createContext(null);

// Provider
export function AbilityProvider({ children }) {
  const {user} = useCurrentUser();

  const ability = useMemo(() => {
    return defineAbilityFor(user);
  }, [user]);

  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  );
}

// Main hook
export function useAbility() {
  const ability = useContext(AbilityContext);
  if (!ability) {
    throw new Error("useAbility must be used within AbilityProvider");
  }
  return ability;
}

// Generic permission checker hook
export function usePermissions(resource) {
  const ability = useAbility();

  return {
    canCreate: ability.can("create", resource),
    canRead: ability.can("read", resource),
    canUpdate: ability.can("update", resource),
    canDelete: ability.can("delete", resource),
    canManage: ability.can("manage", resource),
    // Helper to check any action
    can: (action) => ability.can(action, resource),
  };
}

// Conditional render components
export function Can({ I, a, children, fallback = null }) {
  const ability = useAbility();
  return ability.can(I, a) ? <>{children}</> : <>{fallback}</>;
}

export function Cannot({ I, a, children, fallback = null }) {
  const ability = useAbility();
  return ability.cannot(I, a) ? <>{children}</> : <>{fallback}</>;
}
