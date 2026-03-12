// context/AbilityContext.jsx
"use client";

import { createContext, useContext, useMemo } from "react";
import { defineAbilityFor } from "@/lib/ability";

const AbilityContext = createContext(defineAbilityFor(null));

export function useAbility() {
  return useContext(AbilityContext);
}

export function AbilityProvider({ role, children }) {
  const ability = useMemo(() => defineAbilityFor(role), [role]);

  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  );
}

const DefaultFallback = ({ action, subject }) => (
  <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
    <span>🔒</span>
    <span>
      You don&apos;t have permission to <strong>{action}</strong> .
    </span>
  </div>
);

export function Can({
  I,
  a,
  not = false,
  children,
  fallback,
  showFallback = false,
}) {
  const ability = useAbility();
  const allowed = ability.can(I, a);
  const show = not ? !allowed : allowed;

  if (show) return <>{children}</>;
  if (fallback !== undefined) return <>{fallback}</>;
  if (showFallback) return <DefaultFallback action={I} subject={a} />;
  return null;
}
