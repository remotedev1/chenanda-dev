"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users, UserCheck, UserX, Shield } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from "@/hooks/useUser";
import { UserForm } from "./UserForm";
import { UserTable } from "./UserTable";
import { withPermission } from "@/components/auth/WithPerission";

const UsersMain = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const {
    users,
    setPage,
    pagination,
    loading,
    filters,
    updateFilters,
    refresh,
    stats,
  } = useUsers();
  const { createUser, creating } = useCreateUser();
  const { updateUser, updating } = useUpdateUser();
  const { deleteUser } = useDeleteUser();

  const handleCreate = async (data) => {
    await createUser(data);
    setCreateDialogOpen(false);
    refresh();
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleUpdate = async (data) => {
    await updateUser(selectedUser.id, data);
    setEditDialogOpen(false);
    setSelectedUser(null);
    refresh();
  };

  const handleDelete = async (id, name) => {
    await deleteUser(id, name);
    refresh();
  };

  const handleBlockToggle = async (user) => {
    await updateUser(user.id, { isBlocked: !user.isBlocked });
    refresh();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-orange-500">
            User Management
          </h1>
          <p className="text-muted-foreground">
            Manage system users and their permissions
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              Registered in the system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.active || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently active accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked Users</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats?.blocked || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Blocked or suspended
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats?.admins || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Super admin & admin users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content */}

      <UserTable
        users={users}
        pagination={pagination}
        filters={filters}
        onFilterChange={updateFilters}
        onPageChange={setPage}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBlockToggle={handleBlockToggle}
      />

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-50 dark:bg-slate-800 p-6 rounded-lg text-slate-600 dark:text-slate-300">
          <DialogHeader>
            <DialogTitle className="text-slate-800 dark:text-slate-100">
              Add New User
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Create a new user account with role and permissions
            </DialogDescription>
          </DialogHeader>
          <UserForm
            onSubmit={handleCreate}
            onCancel={() => setCreateDialogOpen(false)}
            loading={creating}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-50 dark:bg-slate-800 p-6 rounded-lg text-slate-600 dark:text-slate-300">
          <DialogHeader>
            <DialogTitle className="text-slate-800 dark:text-slate-100">
              Edit User
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Update user information and permissions
            </DialogDescription>
          </DialogHeader>
          <UserForm
            onSubmit={handleUpdate}
            onCancel={() => {
              setEditDialogOpen(false);
              setSelectedUser(null);
            }}
            loading={updating}
            initialData={selectedUser}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default withPermission("view", "UserManagement")(UsersMain);