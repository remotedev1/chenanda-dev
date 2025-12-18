"use client";
import React, { useState, useMemo } from "react";
import {
  Shield,
  Edit2,
  Trash2,
  Search,
  Filter,
  X,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAbilityContext } from "@/components/providers/AbilityProvider";
import { useCurrentUser } from "@/hooks/use-current-user";

const UserManagementSystem = () => {
  const { user: currentUser } = useCurrentUser();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [toast, setToast] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);

  const ability = useAbilityContext();

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedUsers = useMemo(() => {
    const list = [...users];
    if (!sortConfig.key) return list;

    return list.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key === "createdAt") {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }

      if (aVal == null) return 1;
      if (bVal == null) return -1;

      return sortConfig.direction === "asc"
        ? aVal > bVal
          ? 1
          : -1
        : aVal < bVal
        ? 1
        : -1;
    });
  }, [users, sortConfig]);

  const filteredUsers = useMemo(() => {
    return sortedUsers.filter((user) => {
      const matchesSearch =
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [sortedUsers, searchTerm, roleFilter]);

  const handleDelete = (user) => {
    if (ability.cannot("delete", user)) {
      showToast("You do not have permission to delete this user", "error");
      return;
    }
    setUsers(users.filter((u) => u.id !== user.id));
    showToast("User deleted successfully");
  };

  const handleEdit = (user) => {
    if (ability.cannot("update", user)) {
      showToast("You do not have permission to edit this user", "error");
      return;
    }
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleSave = (userData) => {
    setUsers(
      users.map((u) =>
        u.id === userData.id ? { ...userData, __type: "User" } : u
      )
    );
    showToast("User updated successfully");
    setShowEditModal(false);
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      SUPER_ADMIN: "bg-purple-100 text-purple-800 border-purple-200",
      ADMIN: "bg-blue-100 text-blue-800 border-blue-200",
      MODERATOR: "bg-green-100 text-green-800 border-green-200",
      SCORER: "bg-yellow-100 text-yellow-800 border-yellow-200",
      USER: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[role] || colors.USER;
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return null;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="w-4 h-4 inline ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 inline ml-1" />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  User Management
                </h1>
                <p className="text-sm text-slate-600">
                  Current Role:{" "}
                  <span className="font-semibold text-blue-600">
                    {currentUser.role}
                  </span>
                </p>
              </div>
            </div>
            <div className="text-sm text-slate-500 bg-slate-100 px-3 py-2 rounded-lg">
              💡 Change role in code to test permissions
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-600" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Roles</option>
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="ADMIN">Admin</option>
                <option value="MODERATOR">Moderator</option>
                <option value="SCORER">Scorer</option>
                <option value="USER">User</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                    onClick={() => handleSort("firstName")}
                  >
                    Name <SortIcon column="firstName" />
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                    onClick={() => handleSort("email")}
                  >
                    Email <SortIcon column="email" />
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                    onClick={() => handleSort("role")}
                  >
                    Role <SortIcon column="role" />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                    onClick={() => handleSort("createdAt")}
                  >
                    Created <SortIcon column="createdAt" />
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredUsers.map((user) => {
                  const canEdit = ability.can("update", user);
                  const canDelete = ability.can("delete", user);

                  return (
                    <React.Fragment key={user.id}>
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {user.firstName[0]}
                              {user.lastName?.[0] || ""}
                            </div>
                            <div>
                              <div className="font-medium text-slate-900">
                                {user.firstName} {user.lastName}
                              </div>
                              <button
                                onClick={() =>
                                  setExpandedRow(
                                    expandedRow === user.id ? null : user.id
                                  )
                                }
                                className="text-xs text-blue-600 hover:text-blue-700"
                              >
                                {expandedRow === user.id
                                  ? "Hide details"
                                  : "Show details"}
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-900">
                            {user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(
                              user.role
                            )}`}
                          >
                            {user.role.replaceAll("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {user.phoneNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            {user.isActive && (
                              <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                Active
                              </span>
                            )}
                            {user.isBlocked && (
                              <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                                Blocked
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            {canEdit ? (
                              <button
                                onClick={() => handleEdit(user)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit user"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            ) : (
                              <div
                                className="p-2 text-slate-300"
                                title="No edit permission"
                              >
                                <Edit2 className="w-4 h-4" />
                              </div>
                            )}
                            {canDelete ? (
                              <button
                                onClick={() => handleDelete(user)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete user"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            ) : (
                              <div
                                className="p-2 text-slate-300"
                                title="No delete permission"
                              >
                                <Trash2 className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                      {expandedRow === user.id && (
                        <tr>
                          <td colSpan="7" className="px-6 py-4 bg-slate-50">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-semibold text-slate-700">
                                  Alternate Phone:
                                </span>
                                <span className="ml-2 text-slate-600">
                                  {user.alternateNumber || "N/A"}
                                </span>
                              </div>
                              {user.address && (
                                <>
                                  <div>
                                    <span className="font-semibold text-slate-700">
                                      Address:
                                    </span>
                                    <span className="ml-2 text-slate-600">
                                      {user.address.address}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="font-semibold text-slate-700">
                                      City:
                                    </span>
                                    <span className="ml-2 text-slate-600">
                                      {user.address.city}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="font-semibold text-slate-700">
                                      State:
                                    </span>
                                    <span className="ml-2 text-slate-600">
                                      {user.address.state}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="font-semibold text-slate-700">
                                      ZIP:
                                    </span>
                                    <span className="ml-2 text-slate-600">
                                      {user.address.zip}
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-600">No users found</p>
            </div>
          )}
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-slate-600 text-center">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <UserModal
          user={selectedUser}
          onClose={() => setShowEditModal(false)}
          onSave={handleSave}
          ability={ability}
          currentUserRole={currentUser.role}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5">
          <Alert
            className={`${
              toast.type === "error"
                ? "bg-red-50 border-red-200"
                : "bg-green-50 border-green-200"
            }`}
          >
            <AlertDescription
              className={`flex items-center gap-2 ${
                toast.type === "error" ? "text-red-800" : "text-green-800"
              }`}
            >
              {toast.type === "error" ? (
                <X className="w-4 h-4" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              {toast.message}
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
};

const UserModal = ({ user, onClose, onSave, ability, currentUserRole }) => {
  const [formData, setFormData] = useState(() => ({
    ...user,
    address: user?.address || {
      address: "",
      city: "",
      state: "",
      zip: "",
    },
  }));

  const handleSubmit = () => {
    onSave(formData);
  };

  const canEditField = (field) => {
    return ability.can("update", user, field);
  };

  const canChangeRole = () => {
    return ability.can("changeRole", user);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Edit User</h2>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  disabled={!canEditField("firstName")}
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  disabled={!canEditField("lastName")}
                  value={formData.lastName || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                disabled
                value={formData.email}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-100 text-slate-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  disabled={!canEditField("phoneNumber")}
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Alternate Number
                </label>
                <input
                  type="tel"
                  disabled={!canEditField("alternateNumber")}
                  value={formData.alternateNumber || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      alternateNumber: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
                />
              </div>
            </div>

            {currentUserRole === "SUPER_ADMIN" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Role
                </label>
                <select
                  disabled={!canChangeRole()}
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
                >
                  <option value="USER">User</option>
                  <option value="SCORER">Scorer</option>
                  <option value="MODERATOR">Moderator</option>
                  <option value="ADMIN">Admin</option>
                  {user.role !== "SUPER_ADMIN" && (
                    <option value="SUPER_ADMIN">Super Admin</option>
                  )}
                </select>
              </div>
            )}

            <div className="pt-4 border-t border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-3">Address</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Street Address"
                  disabled={!canEditField("address")}
                  value={formData.address?.address || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, address: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
                />
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="City"
                    disabled={!canEditField("address")}
                    value={formData.address?.city || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, city: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    disabled={!canEditField("address")}
                    value={formData.address?.state || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, state: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
                  />
                  <input
                    type="text"
                    placeholder="ZIP"
                    disabled={!canEditField("address")}
                    value={formData.address?.zip || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, zip: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={!ability.can("update", "User")}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagementSystem;
