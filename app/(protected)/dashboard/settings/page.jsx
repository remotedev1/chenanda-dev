"use client";
import { useState, useMemo, createContext, useContext } from "react";

// ─── Ability System (inlined for demo) ───────────────────────────────────────
const GUEST_ABILITY = { can: () => false };

const AbilityContext = createContext(GUEST_ABILITY);
const useAbility = () => useContext(AbilityContext);

const ROLE_PERMISSIONS = {
  SUPER_ADMIN: {
    Dashboard: ["view", "create", "edit", "delete", "manage"],
    UserManagement: ["view", "create", "edit", "delete", "manage"],
    TournamentManagement: ["view", "create", "edit", "delete", "manage"],
    MatchScoring: ["view", "create", "edit", "delete", "manage"],
    ContentModeration: ["view", "create", "edit", "delete", "manage"],
    Reports: ["view", "create", "edit", "delete", "manage"],
    SystemSettings: ["view", "create", "edit", "delete", "manage"],
    AuditLogs: ["view", "create", "edit", "delete", "manage"],
  },
  ADMIN: {
    Dashboard: ["view"],
    UserManagement: ["view", "create", "edit"],
    TournamentManagement: ["view", "create", "edit", "delete", "manage"],
    MatchScoring: ["view"],
    ContentModeration: ["view"],
    Reports: ["view"],
    SystemSettings: [],
    AuditLogs: [],
  },
  MODERATOR: {
    Dashboard: ["view"],
    UserManagement: [],
    TournamentManagement: ["view"],
    MatchScoring: ["view"],
    ContentModeration: ["view", "create", "edit", "delete", "manage"],
    Reports: [],
    SystemSettings: [],
    AuditLogs: [],
  },
  SCORER: {
    Dashboard: ["view"],
    UserManagement: [],
    TournamentManagement: ["view"],
    MatchScoring: ["view", "edit"],
    ContentModeration: [],
    Reports: [],
    SystemSettings: [],
    AuditLogs: [],
  },
  USER: {
    Dashboard: [],
    UserManagement: [],
    TournamentManagement: [],
    MatchScoring: [],
    ContentModeration: [],
    Reports: [],
    SystemSettings: [],
    AuditLogs: [],
  },
};

function createAbility(role) {
  const perms = ROLE_PERMISSIONS[role] || {};
  return {
    can: (action, subject) => {
      const actions = perms[subject] || [];
      return actions.includes("manage") || actions.includes(action);
    },
  };
}

function Can({ I, a, children, not = false }) {
  const ability = useAbility();
  const allowed = ability.can(I, a);
  if (not ? allowed : !allowed) return null;
  return <>{children}</>;
}

function usePermission(action, subject) {
  const ability = useAbility();
  return ability.can(action, subject);
}

// ─── Icons (SVG inline) ───────────────────────────────────────────────────────
const Icons = {
  Dashboard: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  Users: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Trophy: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
    </svg>
  ),
  Clipboard: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="12" y2="16" />
    </svg>
  ),
  Shield: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Chart: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  Settings: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  Scroll: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="13" y2="17" />
    </svg>
  ),
  Lock: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  Check: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Edit: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Trash: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  ),
  Plus: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
};

const ROLE_META = {
  SUPER_ADMIN: {
    color: "#dc2626",
    bg: "#fef2f2",
    border: "#fca5a5",
    label: "Super Admin",
    desc: "Full system access",
  },
  ADMIN: {
    color: "#7c3aed",
    bg: "#f5f3ff",
    border: "#c4b5fd",
    label: "Admin",
    desc: "Tournament management",
  },
  MODERATOR: {
    color: "#0284c7",
    bg: "#f0f9ff",
    border: "#7dd3fc",
    label: "Moderator",
    desc: "Content management",
  },
  SCORER: {
    color: "#059669",
    bg: "#f0fdf4",
    border: "#6ee7b7",
    label: "Scorer",
    desc: "Match scoring/updates",
  },
  USER: {
    color: "#92400e",
    bg: "#fffbeb",
    border: "#fcd34d",
    label: "User",
    desc: "Basic access",
  },
};

const NAV_ITEMS = [
  {
    label: "Overview",
    subject: "Dashboard",
    icon: "Dashboard",
    href: "/dashboard",
  },
  {
    label: "Users",
    subject: "UserManagement",
    icon: "Users",
    href: "/dashboard/users",
  },
  {
    label: "Tournaments",
    subject: "TournamentManagement",
    icon: "Trophy",
    href: "/dashboard/tournaments",
  },
  {
    label: "Match Scoring",
    subject: "MatchScoring",
    icon: "Clipboard",
    href: "/dashboard/scoring",
  },
  {
    label: "Moderation",
    subject: "ContentModeration",
    icon: "Shield",
    href: "/dashboard/moderation",
  },
  {
    label: "Reports",
    subject: "Reports",
    icon: "Chart",
    href: "/dashboard/reports",
  },
  {
    label: "Audit Logs",
    subject: "AuditLogs",
    icon: "Scroll",
    href: "/dashboard/audit",
  },
  {
    label: "System Settings",
    subject: "SystemSettings",
    icon: "Settings",
    href: "/dashboard/settings",
  },
];

const ALL_SUBJECTS = [
  "Dashboard",
  "UserManagement",
  "TournamentManagement",
  "MatchScoring",
  "ContentModeration",
  "Reports",
  "AuditLogs",
  "SystemSettings",
];
const ALL_ACTIONS = ["view", "create", "edit", "delete", "manage"];

// ─── Components ───────────────────────────────────────────────────────────────
function RoleBadge({ role, selected, onClick }) {
  const meta = ROLE_META[role];
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 14px",
        borderRadius: 8,
        border: `2px solid ${selected ? meta.color : meta.border}`,
        background: selected ? meta.color : meta.bg,
        color: selected ? "#fff" : meta.color,
        fontFamily: "'DM Mono', monospace",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.04em",
        cursor: "pointer",
        transition: "all 0.15s",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 2,
        minWidth: 120,
      }}
    >
      <span style={{ fontSize: 12 }}>{meta.label}</span>
      <span style={{ fontSize: 10, opacity: 0.8, fontWeight: 400 }}>
        {meta.desc}
      </span>
    </button>
  );
}

function SidebarNav({ activeNav, setActiveNav }) {
  const ability = useAbility();
  const meta =
    ROLE_META[
      Object.keys(ROLE_META).find(
        (r) => ability.can("view", "Dashboard") || r === "USER",
      ) || "USER"
    ];

  return (
    <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {NAV_ITEMS.map(({ label, subject, icon, href }) => {
        const IconComp = Icons[icon];
        const canView = ability.can("view", subject);
        const isActive = activeNav === subject;

        if (!canView)
          return (
            <div
              key={subject}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 12px",
                borderRadius: 6,
                opacity: 0.3,
                fontSize: 13,
                color: "#94a3b8",
                textDecoration: "line-through",
              }}
            >
              <IconComp />
              {label}
              <span style={{ marginLeft: "auto" }}>
                <Icons.Lock />
              </span>
            </div>
          );

        return (
          <button
            key={subject}
            onClick={() => setActiveNav(subject)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 12px",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: isActive ? 600 : 400,
              color: isActive ? "#1e293b" : "#64748b",
              background: isActive ? "#f1f5f9" : "transparent",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.1s",
            }}
          >
            <span style={{ color: isActive ? "#6366f1" : "#94a3b8" }}>
              <IconComp />
            </span>
            {label}
          </button>
        );
      })}
    </nav>
  );
}

function ActionButtons({ subject }) {
  const canCreate = usePermission("create", subject);
  const canEdit = usePermission("edit", subject);
  const canDelete = usePermission("delete", subject);
  const canManage = usePermission("manage", subject);

  const btn = (label, icon, color, enabled) => (
    <button
      disabled={!enabled}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "7px 14px",
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 500,
        border: `1.5px solid ${enabled ? color : "#e2e8f0"}`,
        background: enabled ? "white" : "#f8fafc",
        color: enabled ? color : "#cbd5e1",
        cursor: enabled ? "pointer" : "not-allowed",
        transition: "all 0.15s",
      }}
    >
      {icon}
      {label}
      {!enabled && (
        <span style={{ marginLeft: 2, opacity: 0.6 }}>
          <Icons.Lock />
        </span>
      )}
    </button>
  );

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {btn("Create", <Icons.Plus />, "#059669", canCreate)}
      {btn("Edit", <Icons.Edit />, "#0284c7", canEdit)}
      {btn("Delete", <Icons.Trash />, "#dc2626", canDelete)}
      {btn("Manage All", <Icons.Shield />, "#7c3aed", canManage)}
    </div>
  );
}

function PermissionMatrix({ role }) {
  const ability = useMemo(() => createAbility(role), [role]);

  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}
      >
        <thead>
          <tr>
            <th
              style={{
                textAlign: "left",
                padding: "6px 10px",
                color: "#64748b",
                fontWeight: 600,
                borderBottom: "1.5px solid #e2e8f0",
              }}
            >
              Subject
            </th>
            {ALL_ACTIONS.map((a) => (
              <th
                key={a}
                style={{
                  padding: "6px 10px",
                  color: "#64748b",
                  fontWeight: 600,
                  borderBottom: "1.5px solid #e2e8f0",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  fontSize: 10,
                }}
              >
                {a}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ALL_SUBJECTS.map((subject, i) => (
            <tr
              key={subject}
              style={{ background: i % 2 === 0 ? "#fafafa" : "white" }}
            >
              <td
                style={{
                  padding: "6px 10px",
                  fontWeight: 500,
                  color: "#334155",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 11,
                }}
              >
                {subject}
              </td>
              {ALL_ACTIONS.map((action) => {
                const ok = ability.can(action, subject);
                return (
                  <td
                    key={action}
                    style={{ padding: "6px 10px", textAlign: "center" }}
                  >
                    {ok ? (
                      <span
                        style={{
                          color: "#22c55e",
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <Icons.Check />
                      </span>
                    ) : (
                      <span
                        style={{
                          color: "#e2e8f0",
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <Icons.Lock />
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [role, setRole] = useState("ADMIN");
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [tab, setTab] = useState("ui"); // "ui" | "matrix"

  const ability = useMemo(() => createAbility(role), [role]);
  const meta = ROLE_META[role];
  const activeItem = NAV_ITEMS.find((n) => n.subject === activeNav);

  return (
    <AbilityContext.Provider value={ability}>
      <div
        style={{
          minHeight: "100vh",
          background: "#f8fafc",
          fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
          padding: 24,
        }}
      >
        {/* Header */}
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 12,
                marginBottom: 4,
              }}
            >
              <h1
                style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#0f172a",
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                CASL Ability
              </h1>
              <span
                style={{
                  fontSize: 13,
                  color: "#94a3b8",
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                / role-based UI control
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
              Switch roles to see how components and nav items respond to CASL
              permissions.
            </p>
          </div>

          {/* Role Picker */}
          <div
            style={{
              background: "white",
              border: "1.5px solid #e2e8f0",
              borderRadius: 12,
              padding: 20,
              marginBottom: 20,
            }}
          >
            <p
              style={{
                margin: "0 0 12px 0",
                fontSize: 12,
                fontWeight: 600,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Active Role
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {Object.keys(ROLE_META).map((r) => (
                <RoleBadge
                  key={r}
                  role={r}
                  selected={role === r}
                  onClick={() => {
                    setRole(r);
                    setActiveNav("Dashboard");
                  }}
                />
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
            {[
              ["ui", "UI Preview"],
              ["matrix", "Permission Matrix"],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                style={{
                  padding: "7px 16px",
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 500,
                  border: "1.5px solid",
                  borderColor: tab === id ? "#6366f1" : "#e2e8f0",
                  background: tab === id ? "#6366f1" : "white",
                  color: tab === id ? "white" : "#64748b",
                  cursor: "pointer",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "ui" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "220px 1fr",
                gap: 16,
                background: "white",
                border: "1.5px solid #e2e8f0",
                borderRadius: 12,
                overflow: "hidden",
                minHeight: 480,
              }}
            >
              {/* Sidebar */}
              <div
                style={{
                  borderRight: "1.5px solid #f1f5f9",
                  padding: 16,
                  background: "white",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 20,
                    paddingBottom: 16,
                    borderBottom: "1.5px solid #f1f5f9",
                  }}
                >
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      background: meta.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {meta.label[0]}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#1e293b",
                      }}
                    >
                      {meta.label}
                    </div>
                    <div style={{ fontSize: 10, color: "#94a3b8" }}>
                      demo@app.com
                    </div>
                  </div>
                </div>

                <SidebarNav activeNav={activeNav} setActiveNav={setActiveNav} />

                {/* Bulk delete section */}
                <div
                  style={{
                    marginTop: 16,
                    paddingTop: 16,
                    borderTop: "1.5px solid #f1f5f9",
                  }}
                >
                  <Can I="delete" a="UserManagement">
                    <button
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        borderRadius: 6,
                        background: "#fef2f2",
                        border: "1.5px solid #fca5a5",
                        color: "#dc2626",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                      }}
                    >
                      <Icons.Trash /> Bulk Delete Users
                    </button>
                  </Can>
                  <Can I="delete" a="UserManagement" not>
                    <p
                      style={{
                        fontSize: 11,
                        color: "#94a3b8",
                        textAlign: "center",
                        margin: 0,
                        padding: "4px 0",
                      }}
                    >
                      Read-only access
                    </p>
                  </Can>
                </div>
              </div>

              {/* Main Content */}
              <div style={{ padding: 24 }}>
                <div style={{ marginBottom: 20 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 4,
                    }}
                  >
                    <h2
                      style={{
                        margin: 0,
                        fontSize: 18,
                        fontWeight: 700,
                        color: "#0f172a",
                      }}
                    >
                      {activeItem?.label}
                    </h2>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 99,
                        fontSize: 10,
                        fontWeight: 600,
                        background: meta.bg,
                        color: meta.color,
                        border: `1px solid ${meta.border}`,
                        fontFamily: "'DM Mono', monospace",
                      }}
                    >
                      {role}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
                    Action buttons below reflect <strong>{role}</strong>
                    permissions on{" "}
                    <code
                      style={{
                        background: "#f1f5f9",
                        padding: "1px 5px",
                        borderRadius: 4,
                        fontSize: 12,
                      }}
                    >
                      {activeNav}
                    </code>
                  </p>
                </div>

                {/* Action Buttons */}
                <div
                  style={{
                    background: "#f8fafc",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: 8,
                    padding: 16,
                    marginBottom: 20,
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 12px 0",
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    CRUD Controls — usePermission() hook
                  </p>
                  <ActionButtons subject={activeNav} />
                </div>

                {/* Can component demo */}
                <div
                  style={{
                    background: "#f8fafc",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: 8,
                    padding: 16,
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 12px 0",
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    &lt;Can&gt; Component — Declarative Rendering
                  </p>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {ALL_ACTIONS.map((action) => {
                      const ok = ability.can(action, activeNav);
                      return (
                        <div
                          key={action}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "8px 12px",
                            borderRadius: 6,
                            background: ok ? "#f0fdf4" : "#fafafa",
                            border: `1px solid ${ok ? "#bbf7d0" : "#e2e8f0"}`,
                          }}
                        >
                          <span style={{ color: ok ? "#22c55e" : "#cbd5e1" }}>
                            {ok ? <Icons.Check /> : <Icons.Lock />}
                          </span>
                          <code
                            style={{ fontSize: 12, color: "#475569", flex: 1 }}
                          >
                            {`<Can I="${action}" a="${activeNav}">`}
                          </code>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              color: ok ? "#16a34a" : "#94a3b8",
                            }}
                          >
                            {ok ? "RENDERS" : "HIDDEN"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "matrix" && (
            <div
              style={{
                background: "white",
                border: "1.5px solid #e2e8f0",
                borderRadius: 12,
                padding: 20,
              }}
            >
              <div style={{ marginBottom: 16 }}>
                <h3
                  style={{
                    margin: "0 0 4px 0",
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#0f172a",
                  }}
                >
                  Permission Matrix —{" "}
                  <span style={{ color: meta.color }}>{meta.label}</span>
                </h3>
                <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>
                  {meta.desc}
                </p>
              </div>
              <PermissionMatrix role={role} />
            </div>
          )}

          {/* Code hint */}
          <div
            style={{
              marginTop: 16,
              padding: 16,
              background: "#0f172a",
              borderRadius: 8,
              fontFamily: "'DM Mono', monospace",
              fontSize: 12,
              color: "#94a3b8",
              lineHeight: 1.7,
            }}
          >
            <span style={{ color: "#64748b" }}></span>
            <br />
            <span style={{ color: "#7dd3fc" }}>&lt;Can</span>
            <span style={{ color: "#c084fc" }}> I</span>=
            <span style={{ color: "#86efac" }}>delete</span>
            <span style={{ color: "#c084fc" }}> a</span>=
            <span style={{ color: "#86efac" }}>UserManagement</span>
            <span style={{ color: "#7dd3fc" }}>&gt;</span>
            <span style={{ color: "#e2e8f0" }}> &lt;DeleteBtn /&gt; </span>
            <span style={{ color: "#7dd3fc" }}>&lt;/Can&gt;</span>
            <br />
            <span style={{ color: "#c084fc" }}>const</span>
            <span style={{ color: "#e2e8f0" }}> canEdit = </span>
            <span style={{ color: "#7dd3fc" }}>usePermission</span>
            <span style={{ color: "#e2e8f0" }}>(</span>
            <span style={{ color: "#86efac" }}>edit</span>
            <span style={{ color: "#e2e8f0" }}>, </span>
            <span style={{ color: "#86efac" }}>TournamentManagement</span>
            <span style={{ color: "#e2e8f0" }}>)</span>
            <br />
            <span style={{ color: "#c084fc" }}>export default </span>
            <span style={{ color: "#7dd3fc" }}>withPermission</span>
            <span style={{ color: "#e2e8f0" }}>(</span>
            <span style={{ color: "#86efac" }}>view</span>
            <span style={{ color: "#e2e8f0" }}>, </span>
            <span style={{ color: "#86efac" }}>Dashboard</span>
            <span style={{ color: "#e2e8f0" }}>)(DashboardPage)</span>
          </div>
        </div>
      </div>
    </AbilityContext.Provider>
  );
}
