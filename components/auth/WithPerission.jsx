// components/auth/withPermission.tsx
"use client";

import { useAbility } from "../providers/AbilityContext";


// ─── PermissionGate ───────────────────────────────────────────────────────────
// Declarative gate component — prefer this for inline JSX.
//
// <PermissionGate action="delete" subject="UserManagement" fallback={<span>No access</span>}>
//   <DeleteButton />
// </PermissionGate>
export function PermissionGate({ action, subject, children, fallback = null }) {
  const ability = useAbility();
  return ability.can(action, subject) ? <>{children}</> : <>{fallback}</>;
}

// ─── usePermission hook ───────────────────────────────────────────────────────
// Imperative helper — useful for disabling buttons, hiding menu items, etc.
//
// const canEdit = usePermission("edit", "TournamentManagement");
// <button disabled={!canEdit}>Save</button>
export function usePermission(action, subject) {
  const ability = useAbility();
  return ability.can(action, subject);
}

// ─── withPermission HOC ───────────────────────────────────────────────────────
// Wraps a page / component; redirects (or shows fallback) if no access.
//
// export default withPermission("view", "Dashboard")(DashboardPage);
export function withPermission(action, subject, FallbackComponent) {
  return function wrap(WrappedComponent) {
    function WithPermission(props) {
      const ability = useAbility();

      if (!ability.can(action, subject)) {
        if (FallbackComponent) return <FallbackComponent />;
        return (
          <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-red-300 bg-red-50 p-8 text-center text-sm text-red-600">
            <div>
              <p className="font-semibold">Access Denied</p>
              <p className="mt-1 text-xs text-red-400">
                You don&apos;t have permission to {action} this resource.
              </p>
            </div>
          </div>
        );
      }

      return <WrappedComponent {...props} />;
    }

    WithPermission.displayName = `WithPermission(${
      WrappedComponent.displayName ?? WrappedComponent.name ?? "Component"
    })`;

    return WithPermission;
  };
}
