"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  ChevronsUpDown,
  Users,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Trophy,
  Gamepad2,
  X,
} from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useFamilies } from "@/hooks/useFamily";
import { useTournaments } from "@/hooks/useTournament";
import ReactSelect from "react-select";
import { useGames } from "@/hooks/useTournamentGame";

/* ---- Constants ---- */

const PAYMENT_STATUSES = [
  { value: "PENDING", label: "Pending" },
  { value: "COMPLETED", label: "Completed" },
  { value: "FAILED", label: "Failed" },
  { value: "REFUNDED", label: "Refunded" },
];

const PAYMENT_METHODS = [
  { value: "CASH", label: "Cash" },
  { value: "UPI", label: "UPI" },
  { value: "CARD", label: "Card" },
];

/* ---- Schema ---- */

const paymentFormSchema = z.object({
  familyId: z.string().min(1, "Family is required"),
  amount: z.number().positive("Amount must be greater than 0"),
  status: z.string().default("PENDING"),
  description: z.string().max(500).optional().nullable(),
  tournamentId: z.string().optional().nullable(),
  tournamentName: z.string().optional().nullable(),
  gameIds: z.array(z.string()).min(1, "Select at least one game").optional(),
  payerName: z.string().min(1, "Payer name is required"),
  payerEmail: z.string().email("Invalid email").optional().nullable(),
  payerPhone: z.string().min(10, "Phone must be at least 10 digits"),
  payerAltPhone: z.string().optional().nullable(),
  transactionId: z.string().optional().nullable(),
  receiptNumber: z.string().min(5, "Please enter the receipt number"),
  paymentMethod: z.enum(["CASH", "UPI", "CARD"]).optional().nullable(),
  paymentDate: z.date().optional().nullable(),
  feeAmount: z.number().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

/* ---- Shared ReactSelect styles factory ---- */

function makeSelectStyles(error) {
  return {
    control: (provided, state) => ({
      ...provided,
      minHeight: "48px",
      borderColor: error ? "#ef4444" : state.isFocused ? "#10b981" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 1px #10b981" : "none",
      "&:hover": { borderColor: state.isFocused ? "#10b981" : "#d1d5db" },
      cursor: "pointer",
    }),
    valueContainer: (p) => ({ ...p, padding: "4px 8px", gap: "4px" }),
    input: (p) => ({ ...p, margin: "0px" }),
    indicatorSeparator: () => ({ display: "none" }),
    menu: (p) => ({
      ...p,
      backgroundColor: "white",
      zIndex: 50,
      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    }),
    menuList: (p) => ({ ...p, maxHeight: "220px", padding: 0 }),
    option: (p, state) => ({
      ...p,
      backgroundColor: state.isSelected
        ? "#d1fae5"
        : state.isFocused
          ? "#ecfdf5"
          : "white",
      color: "#1f2937",
      cursor: "pointer",
      padding: "8px 12px",
      "&:active": { backgroundColor: "#d1fae5" },
    }),
    multiValue: (p) => ({
      ...p,
      backgroundColor: "#ecfdf5",
      border: "1px solid #a7f3d0",
      borderRadius: "6px",
    }),
    multiValueLabel: (p) => ({
      ...p,
      color: "#065f46",
      fontSize: "12px",
      fontWeight: 600,
      padding: "2px 4px",
    }),
    multiValueRemove: (p) => ({
      ...p,
      color: "#059669",
      cursor: "pointer",
      borderRadius: "0 6px 6px 0",
      "&:hover": { backgroundColor: "#d1fae5", color: "#065f46" },
    }),
    placeholder: (p) => ({ ...p, color: "#9ca3af" }),
  };
}

const sharedDropdownIndicator = (props) => (
  <div {...props.innerProps} className="px-2">
    <ChevronsUpDown className="h-4 w-4 opacity-50" />
  </div>
);

/* ---- Family Combobox ---- */

function FamilyCombobox({
  value,
  onChange,
  families,
  loading,
  error,
  onFamilySelect,
}) {
  const options = families.map((f) => ({
    value: f.id,
    label: f.familyName,
    data: f,
  }));
  const selected = options.find((o) => o.value === value) || null;

  const formatOptionLabel = ({ label, data }) => (
    <div className="flex items-center gap-2">
      <span className="h-6 w-6 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
        {label.charAt(0)}
      </span>
      <div className="flex-1 min-w-0">
        <div className="truncate font-medium">{label}</div>
        {data?.contacts?.[0]?.phone && (
          <div className="text-xs text-gray-500">{data.contacts[0].phone}</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-2">
      <Label>
        Family <span className="text-red-500">*</span>
      </Label>
      <ReactSelect
        value={selected}
        onChange={(opt) => {
          onChange(opt?.value ?? null);
          if (opt && onFamilySelect) onFamilySelect(opt.data);
        }}
        options={options}
        isLoading={loading}
        isDisabled={loading}
        isClearable
        isSearchable
        placeholder={
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4 shrink-0" />
            <span>{loading ? "Loading families..." : "Search family..."}</span>
          </div>
        }
        noOptionsMessage={() => "No family found"}
        styles={makeSelectStyles(error)}
        formatOptionLabel={formatOptionLabel}
        components={{ DropdownIndicator: sharedDropdownIndicator }}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

/* ---- Tournament Combobox ---- */

function TournamentCombobox({ value, onChange, tournaments, loading, error }) {
  const options = tournaments.map((t) => ({
    value: t.id,
    label: t.name,
    data: t,
  }));
  const selected = options.find((o) => o.value === value) || null;

  const formatOptionLabel = ({ label, data }) => (
    <div className="flex items-center gap-2">
      <span className="h-6 w-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shrink-0">
        <Trophy className="h-3 w-3" />
      </span>
      <div className="flex-1 min-w-0">
        <div className="truncate font-medium">{label}</div>
        {data?.status && (
          <div className="text-xs text-gray-500 capitalize">
            {data.status.toLowerCase()}
          </div>
        )}
      </div>
      {data?.status === "ACTIVE" && (
        <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
          Active
        </span>
      )}
    </div>
  );

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1.5">
        <Trophy className="h-3.5 w-3.5 text-muted-foreground" />
        Tournament
      </Label>
      <ReactSelect
        value={selected}
        onChange={(opt) => onChange(opt?.value ?? null, opt?.data ?? null)}
        options={options}
        isLoading={loading}
        isDisabled={loading}
        isClearable
        isSearchable
        placeholder={
          <div className="flex items-center gap-2 text-muted-foreground">
            <Trophy className="h-4 w-4 shrink-0" />
            <span>
              {loading ? "Loading tournaments..." : "Search tournament..."}
            </span>
          </div>
        }
        noOptionsMessage={() => "No tournament found"}
        styles={makeSelectStyles(error)}
        formatOptionLabel={formatOptionLabel}
        components={{ DropdownIndicator: sharedDropdownIndicator }}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

/* ---- ✅ Multi-Game Combobox ---- */

function GameCombobox({
  value,
  onChange,
  games,
  loading,
  error,
  disabled,
  currency,
}) {
  const options = games.map((g) => ({ value: g.id, label: g.name, data: g }));

  // value is now string[] — map to option objects
  const selected = options.filter((o) => value.includes(o.value));

  const formatOptionLabel = ({ label, data }) => (
    <div className="flex items-center gap-2">
      <span className="h-6 w-6 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white shrink-0">
        <Gamepad2 className="h-3 w-3" />
      </span>
      <div className="flex-1 min-w-0">
        <div className="truncate font-medium">{label}</div>
        {data?.sport && (
          <div className="text-xs text-gray-500 capitalize">
            {data.sport.toLowerCase()}
          </div>
        )}
      </div>
      {data?.registrationFee != null && (
        <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
          {currency} {Number(data.registrationFee).toFixed(2)}
        </span>
      )}
    </div>
  );

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1.5">
        <Gamepad2 className="h-3.5 w-3.5 text-muted-foreground" />
        Game Events
        {!disabled && (
          <span className="text-xs text-muted-foreground font-normal">
            (select multiple · auto-sums amount)
          </span>
        )}
      </Label>
      <ReactSelect
        isMulti // ✅ multi-select
        value={selected}
        onChange={(opts) =>
          onChange(
            opts ? opts.map((o) => o.value) : [],
            opts ? opts.map((o) => o.data) : [],
          )
        }
        options={options}
        isLoading={loading}
        isDisabled={disabled || loading}
        isClearable
        isSearchable
        closeMenuOnSelect={false} // keep menu open after each pick
        hideSelectedOptions={true}
        placeholder={
          <div className="flex items-center gap-2 text-muted-foreground">
            <Gamepad2 className="h-4 w-4 shrink-0" />
            <span>
              {disabled
                ? "Select a tournament first..."
                : loading
                  ? "Loading games..."
                  : "Search & select game events..."}
            </span>
          </div>
        }
        noOptionsMessage={() => "No games found for this tournament"}
        styles={makeSelectStyles(error)}
        formatOptionLabel={formatOptionLabel}
        components={{ DropdownIndicator: sharedDropdownIndicator }}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

/* ---- Selected Games Summary ---- */

function SelectedGamesSummary({ selectedGames, currency, onRemove }) {
  if (!selectedGames.length) return null;

  const total = selectedGames.reduce(
    (sum, g) => sum + Number(g?.registrationFee ?? 0),
    0,
  );

  return (
    <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 space-y-2">
      <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
        Selected Games · {selectedGames.length}
      </p>
      <div className="space-y-1.5">
        {selectedGames.map((g) => (
          <div key={g.id} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Gamepad2 className="h-3.5 w-3.5 text-violet-500 shrink-0" />
              <span className="text-sm text-stone-700 truncate">{g.name}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm font-semibold text-emerald-700 tabular-nums">
                {currency} {Number(g.registrationFee ?? 0).toFixed(2)}
              </span>
              <button
                type="button"
                onClick={() => onRemove(g.id)}
                className="p-0.5 rounded-full text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-emerald-200">
        <span className="text-xs font-semibold text-stone-500">Total</span>
        <span className="text-base font-bold text-emerald-700 tabular-nums">
          {currency} {total.toFixed(2)}
        </span>
      </div>
    </div>
  );
}

/* ---- Collapsible Optional Section ---- */

function OptionalSection({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-dashed border-gray-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-3 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium">{title}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <div className="p-4 pt-0 border-t border-dashed border-gray-200">
          {children}
        </div>
      )}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </p>
  );
}

/* ---- Main Component ---- */

export function PaymentForm({
  onSubmit,
  onCancel,
  loading,
  initialData = null,
}) {
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [existingPayments, setExistingPayments] = useState([]);
  const [checkingPayments, setCheckingPayments] = useState(false);
  // ✅ track selected game objects for the summary panel
  const [selectedGameObjects, setSelectedGameObjects] = useState([]);

  const [formData, setFormData] = useState({
    familyId: initialData?.familyId || "",
    payerName: initialData?.payerName || "",
    payerEmail: initialData?.payerEmail || "",
    payerPhone: initialData?.payerPhone || "",
    payerAltPhone: initialData?.payerAltPhone || "",
    amount: initialData?.amount || "",
    tournamentId: initialData?.tournamentId || "",
    tournamentName: initialData?.tournamentName || "",
    gameIds: initialData?.gameIds || [], // ✅ array
    description: initialData?.description || "",
    status: initialData?.status || "COMPLETED",
    transactionId: initialData?.transactionId || "",
    receiptNumber: initialData?.receiptNumber,
    paymentMethod: initialData?.paymentMethod || "",
    paymentDate: initialData?.paymentDate
      ? new Date(initialData.paymentDate)
      : new Date(),
    feeAmount: initialData?.feeAmount || "",
    notes: initialData?.notes || "",
  });

  const [errors, setErrors] = useState({});

  const { families, loading: loadingFamilies } = useFamilies();

  const { tournaments, loading: loadingTournaments } = useTournaments({
    limit: 100,
  });

  const gameFilters = useMemo(
    () =>
      formData.tournamentId
        ? { tournamentId: formData.tournamentId, limit: 200 }
        : null,
    [formData.tournamentId],
  );
  const { games, loading: loadingGames } = useGames(gameFilters);

  // Auto-select active tournament on mount
  useEffect(() => {
    if (initialData?.tournamentId || !tournaments?.length) return;
    const active = tournaments.find((t) => t.status === "ACTIVE");
    if (active) {
      setFormData((prev) => ({
        ...prev,
        tournamentId: active.id,
        tournamentName: active.name,
      }));
    }
  }, [tournaments, initialData]);

  // ✅ Auto-sum fees whenever selected games change
  useEffect(() => {
    if (!selectedGameObjects.length) return;
    const total = selectedGameObjects.reduce(
      (sum, g) => sum + Number(g?.registrationFee ?? 0),
      0,
    );
    if (total > 0) {
      setFormData((prev) => ({ ...prev, amount: total }));
    }
  }, [selectedGameObjects]);

  const alreadyPaidGameIds = new Set(
    selectedFamily?.payments?.map((p) => p.gameId).filter(Boolean) || [],
  );
  const alreadyPaidGames = formData.gameIds.filter((id) =>
    alreadyPaidGameIds.has(id),
  );
  const hasAlreadyPaidGame = alreadyPaidGames.length > 0;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleTournamentChange = (id, tournament) => {
    setFormData((prev) => ({
      ...prev,
      tournamentId: id || "",
      tournamentName: tournament?.name || "",
      gameIds: [], // reset games when tournament changes
      amount: "",
    }));
    setSelectedGameObjects([]);
    if (errors.tournamentId)
      setErrors((prev) => ({ ...prev, tournamentId: undefined }));
  };

  // ✅ receives arrays: (ids[], gameDataObjects[])
  const handleGameChange = (ids, gameDataArray) => {
    handleChange("gameIds", ids);
    setSelectedGameObjects(gameDataArray || []);
  };

  const handleRemoveGame = (gameId) => {
    const newIds = formData.gameIds.filter((id) => id !== gameId);
    const newObjects = selectedGameObjects.filter((g) => g.id !== gameId);
    handleChange("gameIds", newIds);
    setSelectedGameObjects(newObjects);
  };

  const checkExistingPayments = async (familyId) => {
    if (!familyId) {
      setExistingPayments([]);
      return;
    }
    setCheckingPayments(true);
    try {
      const res = await fetch(`/api/payments?familyId=${familyId}&limit=100`);
      const data = await res.json();
      if (data.success && data.data) {
        setExistingPayments(data.data);
        if (data.data.length > 0) {
          toast.info(
            `Found ${data.data.length} existing payment(s) for this family`,
          );
        }
      }
    } catch (err) {
      console.error("Error checking payments:", err);
    } finally {
      setCheckingPayments(false);
    }
  };

  const handleFamilySelect = (family) => {
    setSelectedFamily(family);
    checkExistingPayments(family.id);
    if (family.contacts?.[0]) {
      const c = family.contacts[0];
      setFormData((prev) => ({
        ...prev,
        payerName: c.name || "",
        payerEmail: c.email || "",
        payerPhone: c.phone || "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    try {
      const dataToValidate = {
        ...formData,
        amount: parseFloat(formData.amount),
        feeAmount: formData.feeAmount ? parseFloat(formData.feeAmount) : null,
        payerAltPhone: formData.payerAltPhone || null,
        payerEmail: formData.payerEmail || null,
        tournamentId: formData.tournamentId || null,
        tournamentName: formData.tournamentName || null,
        gameIds: formData.gameIds.length ? formData.gameIds : undefined,
        description: formData.description || null,
        transactionId: formData.transactionId || null,
        receiptNumber: formData.receiptNumber,
        paymentMethod: formData.paymentMethod || null,
        notes: formData.notes || null,
      };
      const validated = paymentFormSchema.parse(dataToValidate);
      await onSubmit({
        ...validated,
        paymentDate: validated.paymentDate?.toISOString(),
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = {};
        error.errors.forEach((err) => {
          fieldErrors[err.path[0]] = err.message;
        });
        setErrors(fieldErrors);
        toast.error(error.errors[0].message);
      } else {
        toast.error("An error occurred. Please try again.");
      }
    }
  };

  const currencySymbol =
    formData.currency === "INR"
      ? "₹"
      : formData.currency === "USD"
        ? "$"
        : formData.currency || "₹";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── Family ── */}
      <div className="space-y-4">
        <SectionLabel>Family</SectionLabel>
        <FamilyCombobox
          value={formData.familyId}
          onChange={(v) => {
            handleChange("familyId", v);
            if (!v) {
              setSelectedFamily(null);
              setExistingPayments([]);
            }
          }}
          families={families || []}
          loading={loadingFamilies}
          error={errors.familyId}
          onFamilySelect={handleFamilySelect}
        />

        {checkingPayments && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>Checking existing payments...</AlertDescription>
          </Alert>
        )}

        {existingPayments.length > 0 && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>
                Found {existingPayments.length} existing payment(s)
              </strong>
              <div className="mt-2 space-y-1 text-sm">
                {existingPayments.slice(0, 3).map((p) => (
                  <div key={p.id} className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    <span>
                      {p.currency} {p.amount.toFixed(2)} —{" "}
                      {p.paymentType || "N/A"} — {p.status}
                      {p.tournamentName && ` (${p.tournamentName})`}
                    </span>
                  </div>
                ))}
                {existingPayments.length > 3 && (
                  <div className="text-xs text-yellow-700 mt-1">
                    ...and {existingPayments.length - 3} more
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* ── Payer Contact ── */}
      <div className="space-y-4">
        <SectionLabel>Payer Contact</SectionLabel>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>
              Payer Name <span className="text-red-500">*</span>
            </Label>
            <Input
              value={formData.payerName}
              onChange={(e) => handleChange("payerName", e.target.value)}
              placeholder="Full name"
              className={cn("h-12", errors.payerName && "border-red-500")}
            />
            {errors.payerName && (
              <p className="text-sm text-red-500">{errors.payerName}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>
              Phone <span className="text-red-500">*</span>
            </Label>
            <Input
              type="tel"
              value={formData.payerPhone}
              onChange={(e) => handleChange("payerPhone", e.target.value)}
              placeholder="10-digit mobile number"
              className={cn("h-12", errors.payerPhone && "border-red-500")}
            />
            {errors.payerPhone && (
              <p className="text-sm text-red-500">{errors.payerPhone}</p>
            )}
          </div>
        </div>
        <OptionalSection title="+ Additional contact details (email, alternate phone)">
          <div className="grid gap-4 md:grid-cols-2 pt-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.payerEmail}
                onChange={(e) => handleChange("payerEmail", e.target.value)}
                placeholder="email@example.com"
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label>Alternate Phone</Label>
              <Input
                type="tel"
                value={formData.payerAltPhone}
                onChange={(e) => handleChange("payerAltPhone", e.target.value)}
                placeholder="Optional"
                className="h-12"
              />
            </div>
          </div>
        </OptionalSection>
      </div>

      {/* ── Payment Details ── */}
      <div className="space-y-4">
        <SectionLabel>Payment Details</SectionLabel>

        <TournamentCombobox
          value={formData.tournamentId}
          onChange={handleTournamentChange}
          tournaments={tournaments || []}
          loading={loadingTournaments}
          error={errors.tournamentId}
        />

        {/* ✅ Multi-select game combobox */}
        <GameCombobox
          value={formData.gameIds}
          onChange={handleGameChange}
          games={games || []}
          loading={loadingGames}
          error={errors.gameIds}
          disabled={!formData.tournamentId}
          currency={currencySymbol}
        />

        {/* ✅ Selected games summary with auto-summed total */}
        <SelectedGamesSummary
          selectedGames={selectedGameObjects}
          currency={currencySymbol}
          onRemove={handleRemoveGame}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>
              Amount <span className="text-red-500">*</span>
              {selectedGameObjects.length > 1 && (
                <span className="ml-2 text-xs font-normal text-emerald-600">
                  (auto-summed from {selectedGameObjects.length} games)
                </span>
              )}
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium pointer-events-none">
                {currencySymbol}
              </span>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                placeholder="0.00"
                className={cn("h-12 pl-8", errors.amount && "border-red-500")}
              />
            </div>
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(v) => handleChange("status", v)}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {PAYMENT_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select
              value={formData.paymentMethod}
              onValueChange={(v) => handleChange("paymentMethod", v)}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {PAYMENT_METHODS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Receipt Number</Label>
            <Input
              value={formData.receiptNumber}
              onChange={(e) => handleChange("receiptNumber", e.target.value)}
              placeholder="Receipt / invoice number"
              className="h-12"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Input
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Brief payment description"
            className="h-12"
          />
        </div>
      </div>

      {/* ── Optional sections ── */}
      <div className="space-y-3">
        <OptionalSection title="+ Reference details (transaction ID, receipt, date, fee)">
          <div className="grid gap-4 md:grid-cols-2 pt-4">
            <div className="space-y-2">
              <Label>Transaction ID</Label>
              <Input
                value={formData.transactionId}
                onChange={(e) => handleChange("transactionId", e.target.value)}
                placeholder="Gateway transaction ID"
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label>Payment Date</Label>
              <Input
                type="date"
                value={
                  formData.paymentDate
                    ? format(new Date(formData.paymentDate), "yyyy-MM-dd")
                    : ""
                }
                onChange={(e) =>
                  handleChange(
                    "paymentDate",
                    e.target.value ? new Date(e.target.value) : null,
                  )
                }
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label>Gateway Fee</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium pointer-events-none">
                  {currencySymbol}
                </span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.feeAmount}
                  onChange={(e) => handleChange("feeAmount", e.target.value)}
                  placeholder="0.00"
                  className="h-12 pl-8"
                />
              </div>
            </div>
          </div>
        </OptionalSection>

        <OptionalSection title="+ Notes">
          <div className="pt-4">
            <Textarea
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Additional notes or remarks..."
              rows={3}
            />
          </div>
        </OptionalSection>
      </div>

      {hasAlreadyPaidGame && (
        <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl">
          <p className="text-amber-800 font-semibold text-sm">
            ⚠️ This family has already paid for{" "}
            {alreadyPaidGames.length === 1
              ? "one of the selected games"
              : `${alreadyPaidGames.length} of the selected games`}
            .
          </p>
        </div>
      )}

      {/* ── Actions ── */}
      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={
            loading || loadingFamilies || checkingPayments || hasAlreadyPaidGame
          }
          className="bg-emerald-600 hover:bg-emerald-700 min-w-[140px]"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? "Update Payment" : "Record Payment"}
        </Button>
      </div>
    </form>
  );
}
