
import { useState, useEffect } from "react";
import { toast } from "sonner";

/**
 * Hook for fetching users with filtering and pagination
 */
export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
    totalItems: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    role: undefined,
    status: undefined,
    verified: undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    blocked: 0,
    admins: 0,
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Build query params
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: pagination.pageSize.toString(),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });

      // Add optional filters
      if (filters.search) params.append("search", filters.search);
      if (filters.role) params.append("role", filters.role);
      if (filters.status) params.append("status", filters.status);
      if (filters.verified) params.append("verified", filters.verified);

      const response = await fetch(`/api/users?${params}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch users");
      }

      const result = await response.json();

      // Handle the new response structure
      setUsers(result.data || []);
      setPagination({
        currentPage: result.currentPage || 1,
        pageSize: result.pageSize || 10,
        totalPages: result.totalPages || 1,
        totalItems: result.totalItems || 0,
      });
      setStats(
        result.stats || {
          total: 0,
          active: 0,
          blocked: 0,
          admins: 0,
        },
      );
    } catch (error) {
      toast.error(error.message || "Failed to fetch users");
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [pagination.currentPage, filters]);

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, currentPage: 1 })); // Reset to first page
  };

  const setPage = (page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const refresh = () => {
    fetchUsers();
  };

  return {
    users,
    loading,
    pagination,
    filters,
    stats,
    updateFilters,
    setPage,
    refresh,
  };
};

/**
 * Hook for creating users
 */
export const useCreateUser = () => {
  const [creating, setCreating] = useState(false);

  const createUser = async (userData) => {
    setCreating(true);
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create user");
      }

      const result = await response.json();
      toast.success(result.message || "User created successfully");
      return result.data || result;
    } catch (error) {
      toast.error(error.message || "Failed to create user");
      throw error;
    } finally {
      setCreating(false);
    }
  };

  return { createUser, creating };
};

/**
 * Hook for updating users
 */
export const useUpdateUser = () => {
  const [updating, setUpdating] = useState(false);

  const updateUser = async (userId, userData) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update user");
      }

      const result = await response.json();
      toast.success(result.message || "User updated successfully");
      return result.data || result;
    } catch (error) {
      toast.error(error.message || "Failed to update user");
      throw error;
    } finally {
      setUpdating(false);
    }
  };

  return { updateUser, updating };
};

/**
 * Hook for deleting users
 */
export const useDeleteUser = () => {
  const [deleting, setDeleting] = useState(false);

  const deleteUser = async (userId, userName) => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete user");
      }

      const result = await response.json();
      toast.success(result.message || "User deleted successfully");
      return result;
    } catch (error) {
      toast.error(error.message || "Failed to delete user");
      throw error;
    } finally {
      setDeleting(false);
    }
  };

  return { deleteUser, deleting };
};

/**
 * Hook for fetching a single user
 */
export const useUser = (userId) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/users/${userId}`);

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to fetch user");
        }

        const result = await response.json();
        setUser(result.data || result);
      } catch (err) {
        setError(err.message);
        toast.error(err.message || "Failed to fetch user");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  return { user, loading, error };
};
