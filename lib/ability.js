// lib/ability.ts
import { AbilityBuilder, createMongoAbility } from "@casl/ability";

// ─── Ability type ────────────────────────────────────────────────────────────

// ─── Factory ─────────────────────────────────────────────────────────────────
export function defineAbilityFor(role) {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

  switch (role) {
    // ── SUPER_ADMIN: full system access ──────────────────────────────────────
    case "SUPER_ADMIN":
      can("manage", "all");
      break;

    // ── ADMIN: tournament management ─────────────────────────────────────────
    case "ADMIN":
      can("view", "Dashboard");
      can("view", "TournamentManagement");
      can("view", "FamilyManagement");
      can("view", "SponsorManagement");
      can("manage", "PlayerManagement");
      can("view", "PaymentManagement");
      
      can("view", "MatchScoring");
      can("view", "Reports");
      can("view", "ContentModeration");
      cannot("edit", "TournamentManagement");
      cannot("view", "SystemSettings");
      cannot("view", "AuditLogs");
      break;

    // ── MODERATOR: content management ────────────────────────────────────────
    case "MODERATOR":
      can("view", "Dashboard");
      can("manage", "ContentModeration");
      can("view", "MatchScoring");
      cannot("view", "UserManagement");
      cannot("view", "SystemSettings");
      cannot("view", "AuditLogs");
      cannot("view", "Reports");
      break;

    // ── SCORER: match scoring / updates ──────────────────────────────────────
    case "SCORER":
      can("view", "Dashboard");
      can("view", "MatchScoring");
      can("edit", "MatchScoring");
      can("view", "TournamentManagement");
      cannot("manage", "TournamentManagement");
      cannot("view", "UserManagement");
      cannot("view", "ContentModeration");
      cannot("view", "SystemSettings");
      cannot("view", "Reports");
      break;

    // ── USER: basic access ────────────────────────────────────────────────────
    case "USER":
      can("view", "PublicContent");
      can("view", "Profile");
      cannot("view", "Dashboard");
      cannot("view", "UserManagement");
      cannot("view", "TournamentManagement");
      cannot("view", "MatchScoring");
      cannot("view", "ContentModeration");
      cannot("view", "SystemSettings");
      cannot("view", "Reports");
      cannot("view", "AuditLogs");
      break;

    // ── Guest / unauthenticated ───────────────────────────────────────────────
    default:
      can("view", "PublicContent");
      break;
  }

  return build();
}

// ─── Serialise / deserialise (useful for JWT / session storage) ───────────────
export function packRules(ability) {
  return ability.rules;
}

export function unpackAbility(rules) {
  return createMongoAbility(rules);
}
