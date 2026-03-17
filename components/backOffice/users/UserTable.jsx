"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MoreHorizontal,
  Search,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  Mail,
  Phone,
  Shield,
  Eye,
} from "lucide-react";
import { format } from "date-fns";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const getRoleBadgeColor = (role) => {
  const colors = {
    SUPER_ADMIN: "bg-purple-500 hover:bg-purple-600",
    ADMIN: "bg-orange-500 hover:bg-orange-600",
    MANAGER: "bg-blue-500 hover:bg-blue-600",
    USER: "bg-gray-500 hover:bg-gray-600",
  };
  return colors[role] || colors.USER;
};

const getStatusBadge = (isActive, isBlocked) => {
  if (isBlocked) {
    return <Badge variant="destructive">Blocked</Badge>;
  }
  if (isActive) {
    return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>;
  }
  return <Badge variant="secondary">Inactive</Badge>;
};

export const UserTable = ({
  users,
  pagination,
  filters,
  onFilterChange,
  onPageChange,
  onEdit,
  onDelete,
  onBlockToggle,
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      onDelete(
        userToDelete.id,
        `${userToDelete.firstName} ${userToDelete.lastName}`,
      );
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={filters.search || ""}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Select
            value={filters.role || "all"}
            onValueChange={(value) =>
              onFilterChange({ role: value === "all" ? undefined : value })
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent className="bg-slate-50">
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="MANAGER">Manager</SelectItem>
              <SelectItem value="USER">User</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.status || "all"}
            onValueChange={(value) =>
              onFilterChange({ status: value === "all" ? undefined : value })
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="bg-slate-50">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.verified || "all"}
            onValueChange={(value) =>
              onFilterChange({ verified: value === "all" ? undefined : value })
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Verification" />
            </SelectTrigger>
            <SelectContent className="bg-slate-50">
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="email">Email Verified</SelectItem>
              <SelectItem value="phone">Phone Verified</SelectItem>
              <SelectItem value="both">Both Verified</SelectItem>
              <SelectItem value="none">Not Verified</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Verification</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <p className="text-muted-foreground">No users found</p>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  {/* User */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={user.images?.[0]}
                          alt={user.firstName}
                        />
                        <AvatarFallback>
                          {getInitials(user.firstName, user.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Contact */}
                  <TableCell>
                    <div className="space-y-1">
                      {user.phoneNumber && (
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          {user.phoneNumber}
                        </div>
                      )}
                      {user.alternateNumber && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {user.alternateNumber}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Role */}
                  <TableCell>
                    <Badge className={getRoleBadgeColor(user.role)}>
                      <Shield className="mr-1 h-3 w-3" />
                      {user.role.replace("_", " ")}
                    </Badge>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    {getStatusBadge(user.isActive, user.isBlocked)}
                  </TableCell>

                  {/* Verification */}
                  <TableCell>
                    <div className="flex gap-2">
                      {user.emailVerified && (
                        <Badge
                          variant="outline"
                          className="text-green-600 border-green-600"
                        >
                          <Mail className="mr-1 h-3 w-3" />
                          Email
                        </Badge>
                      )}
                      {user.phoneVerified && (
                        <Badge
                          variant="outline"
                          className="text-blue-600 border-blue-600"
                        >
                          <Phone className="mr-1 h-3 w-3" />
                          Phone
                        </Badge>
                      )}
                      {!user.emailVerified && !user.phoneVerified && (
                        <Badge variant="outline" className="text-gray-400">
                          None
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  {/* Last Login */}
                  <TableCell>
                    {user.lastLoginAt ? (
                      <div className="text-sm">
                        <div>
                          {format(new Date(user.lastLoginAt), "MMM dd, yyyy")}
                        </div>
                        <div className="text-muted-foreground">
                          {format(new Date(user.lastLoginAt), "HH:mm")}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Never</span>
                    )}
                  </TableCell>

                  {/* Joined */}
                  <TableCell className="text-sm">
                    {format(new Date(user.createdAt), "MMM dd, yyyy")}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-slate-50">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>

                        <DropdownMenuItem onClick={() => onEdit(user)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => onEdit(user)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit User
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => onBlockToggle(user)}
                          className={
                            user.isBlocked
                              ? "text-green-600"
                              : "text-orange-600"
                          }
                        >
                          {user.isBlocked ? (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Unblock User
                            </>
                          ) : (
                            <>
                              <Ban className="mr-2 h-4 w-4" />
                              Block User
                            </>
                          )}
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(user)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(pagination.currentPage - 1) * pagination.pageSize + 1} to{" "}
            {Math.min(
              pagination.currentPage * pagination.pageSize,
              pagination.totalItems,
            )}{" "}
            of {pagination.totalItems} users
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => onPageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                />
              </PaginationItem>
              {[...Array(pagination.totalPages)].map((_, index) => {
                const page = index + 1;
                if (
                  page === 1 ||
                  page === pagination.totalPages ||
                  (page >= pagination.currentPage - 1 &&
                    page <= pagination.currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => onPageChange(page)}
                        isActive={page === pagination.currentPage}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                } else if (
                  page === pagination.currentPage - 2 ||
                  page === pagination.currentPage + 2
                ) {
                  return (
                    <PaginationItem key={page}>
                      <span className="px-4">...</span>
                    </PaginationItem>
                  );
                }
                return null;
              })}
              <PaginationItem>
                <PaginationNext
                  onClick={() => onPageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user account for{" "}
              <span className="font-semibold">
                {userToDelete?.firstName} {userToDelete?.lastName}
              </span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
