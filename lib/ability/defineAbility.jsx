// lib/ability/defineAbility.ts
import { AbilityBuilder } from "@casl/ability";
import { createMongoAbility } from "@casl/ability";

export function defineAbilityFor(role) {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

  if (role === "superadmin") {
    can("manage", "all"); // admin can do everything
  } else if (role === "admin") {
    can("read", "Post");
    can("update", "Post");
    cannot("delete", "Post");
  } else if (role === "editor") {
    can("read", "Post");
    can("update", "Post");
    cannot("delete", "Post");
  } else {
    can("read", "Post");
  }

  return build({
    detectSubjectType: (item) => item.type,
  });
}
