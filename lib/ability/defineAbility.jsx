import { AbilityBuilder, createMongoAbility } from "@casl/ability";

export const defineAbilityFor = (user) => {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

  if (user.role === "SUPER_ADMIN") {
    // 🔑 Full system access
    can("manage", "all");

    // ❌ Even SUPER_ADMIN cannot delete SUPER_ADMIN users
    cannot("delete", "User", { role: "SUPER_ADMIN" });

    // ✅ Can change role of non-SUPER_ADMIN users
    can("changeRole", "User", { role: { $ne: "SUPER_ADMIN" } });

    // 🏆 Tournament – full access
    can("create", "Tournament");
    can("read", "Tournament");
    can("update", "Tournament");
    can("delete", "Tournament");
  }

  else if (user.role === "ADMIN") {
    // 👤 User permissions
    can("read", "User");
    can("update", "User", [
      "firstName",
      "lastName",
      "phoneNumber",
      "alternateNumber",
      "address",
    ]);

    cannot("delete", "User");
    cannot("changeRole", "User");

    // 🏆 Tournament – view only
    can("read", "Tournament");
    cannot("create", "Tournament");
    cannot("update", "Tournament");
    cannot("delete", "Tournament");
  }

  else if (user.role === "MODERATOR" || user.role === "SCORER") {
    // 👤 User permissions
    can("read", "User");

    cannot("update", "User");
    cannot("delete", "User");
    cannot("changeRole", "User");

    // 🏆 Tournament – view only
    can("read", "Tournament");
    cannot("create", "Tournament");
    cannot("update", "Tournament");
    cannot("delete", "Tournament");
  }

  else if (user.role === "USER") {
    // 👤 Own profile only
    can("read", "User", { id: user.id });
    can(
      "update",
      "User",
      ["firstName", "lastName", "phoneNumber", "alternateNumber", "address"],
      { id: user.id }
    );

    cannot("delete", "User");
    cannot("changeRole", "User");

    // 🏆 Tournament – view only
    can("read", "Tournament");
    cannot("create", "Tournament");
    cannot("update", "Tournament");
    cannot("delete", "Tournament");
  }

  return build({
    detectSubjectType: (item) =>
      typeof item === "string" ? item : item.__type || item.constructor.name,
  });
};
