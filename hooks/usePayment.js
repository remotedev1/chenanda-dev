// hooks/usePayment.js
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

/* ---- usePayments (List/Fetch) ---- */

export function usePayments({
  familyId,
  tournamentId,
  gameId,
  sport,
  status,
  paymentType,
  initialLimit = 10,
} = {}) {
  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    status: status || undefined,
    paymentType: paymentType || undefined,
    sport: sport || undefined,
  });
  const [page, setPage] = useState(1);
  const [limit] = useState(initialLimit);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(familyId && { familyId }),
        ...(tournamentId && { tournamentId }),
        ...(gameId && { gameId }),
        ...(filters.sport && { sport: filters.sport }),
        ...(filters.status && { status: filters.status }),
        ...(filters.paymentType && { paymentType: filters.paymentType }),
      });

      const response = await fetch(`/api/tournaments/payment?${params}`);
      const { data } = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch payments");
      }

      setPayments(data.data || []);
      setPagination(data.pagination || null);
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, [page, limit, filters, familyId, tournamentId, gameId]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1); // Reset to first page when filters change
  };

  const refresh = () => {
    fetchPayments();
  };

  return {
    payments,
    pagination,
    loading,
    error,
    filters,
    updateFilters,
    setPage,
    refresh,
  };
}

/* ---- usePayment (Single) ---- */

export function usePayment(id) {
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPayment = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/payments/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch payment");
      }

      setPayment(data.data);
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Failed to load payment");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPayment();
  }, [fetchPayment]);

  const refresh = () => {
    fetchPayment();
  };

  return { payment, loading, error, refresh };
}

/* ---- useCreatePayment ---- */

export function useCreatePayment() {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  const createPayment = async (data) => {
    setCreating(true);
    setError(null);

    try {
      const response = await fetch("/api/tournaments/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create payment");
      }

      if (data.bulk) {
        toast.success(
          result.message ||
            `${result.data.length} payment(s) created successfully`,
        );
      } else {
        toast.success(result.message || "Payment created successfully");
      }

      return result.data;
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Failed to create payment");
      throw err;
    } finally {
      setCreating(false);
    }
  };

  return { createPayment, creating, error };
}

/* ---- useUpdatePayment ---- */

export function useUpdatePayment() {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  const updatePayment = async (id, data) => {
    setUpdating(true);
    setError(null);

    try {
      const response = await fetch(`/api/payments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update payment");
      }

      toast.success(result.message || "Payment updated successfully");
      return result.data;
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Failed to update payment");
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  return { updatePayment, updating, error };
}

/* ---- useDeletePayment ---- */

export function useDeletePayment() {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const deletePayment = async (id, name = "this payment") => {
    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/payments/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete payment");
      }

      toast.success(result.message || `${name} deleted successfully`);
      return true;
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Failed to delete payment");
      throw err;
    } finally {
      setDeleting(false);
    }
  };

  return { deletePayment, deleting, error };
}

/* ---- usePaymentStats ---- */

export function usePaymentStats({ tournamentId, familyId } = {}) {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    failed: 0,
    refunded: 0,
    totalAmount: 0,
    completedAmount: 0,
    pendingAmount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          limit: "1000", // Get all payments for stats
          ...(tournamentId && { tournamentId }),
          ...(familyId && { familyId }),
        });

        const response = await fetch(`/api/payments?${params}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch payment stats");
        }

        const payments = data.data || [];

        const calculated = payments.reduce(
          (acc, payment) => {
            acc.total++;
            acc.totalAmount += payment.amount;

            switch (payment.status) {
              case "COMPLETED":
                acc.completed++;
                acc.completedAmount += payment.amount;
                break;
              case "PENDING":
                acc.pending++;
                acc.pendingAmount += payment.amount;
                break;
              case "FAILED":
                acc.failed++;
                break;
              case "REFUNDED":
                acc.refunded++;
                break;
            }

            return acc;
          },
          {
            total: 0,
            completed: 0,
            pending: 0,
            failed: 0,
            refunded: 0,
            totalAmount: 0,
            completedAmount: 0,
            pendingAmount: 0,
          },
        );

        setStats(calculated);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [tournamentId, familyId]);

  return { stats, loading, error };
}
