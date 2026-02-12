import { AbilityBuilder, createMongoAbility } from "@casl/ability";

// Define all your resource types
export const RESOURCES = {
  TOURNAMENT: "Tournament",
  PARTICIPATION: "Participation",
  MATCH: "Match",
  PLACEMENT: "Placement",
  PLAYER: "Player",
  ALL: "all",
  // Add more as needed
};

// Define all actions
export const ACTIONS = {
  CREATE: "create",
  READ: "read",
  UPDATE: "update",
  DELETE: "delete",
  MANAGE: "manage",
};

// Single ability definition function
export function defineAbilityFor(user) {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);
  // Guest permissions (no user)
  if (!user) {
    can(ACTIONS.READ, RESOURCES.TOURNAMENT);
    cannot(ACTIONS.CREATE, RESOURCES.TOURNAMENT);
    return build({ detectSubjectType: (item) => item.__type });
  }

  // Role-based permissions
  switch (user.role) {
    case "SUPER_ADMIN":
      can(ACTIONS.MANAGE, RESOURCES.ALL);
      break;

    case "ORGANIZER":
      can(
        [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE],
        RESOURCES.TOURNAMENT,
      );
      can(ACTIONS.MANAGE, [
        RESOURCES.PARTICIPATION,
        RESOURCES.MATCH,
        RESOURCES.PLACEMENT,
      ]);
      break;

    case "USER":
      can(ACTIONS.READ, [
        RESOURCES.TOURNAMENT,
        RESOURCES.MATCH,
        RESOURCES.PARTICIPATION,
      ]);
      cannot([ACTIONS.CREATE, ACTIONS.UPDATE], RESOURCES.TOURNAMENT);
      break;

    default:
      // Default to guest permissions
      can(ACTIONS.READ, RESOURCES.TOURNAMENT);
      break;
  }

  return build({ detectSubjectType: (item) => item.__type });
}
