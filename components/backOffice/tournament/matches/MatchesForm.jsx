"use client";

import { useState } from "react";
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
import {
  Loader2,
  Clock,
  ChevronsUpDown,
  Swords,
  Users,
  Trophy,
} from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useFamilies } from "@/hooks/useFamily";
import ReactSelect from "react-select";

/* ---- Constants ---- */

const SPORT_TYPES = [
  { value: "FOOTBALL", label: "Football", icon: "⚽" },
  { value: "BASKETBALL", label: "Basketball", icon: "🏀" },
  { value: "VOLLEYBALL", label: "Volleyball", icon: "🏐" },
  { value: "CRICKET", label: "Cricket", icon: "🏏" },
  { value: "TENNIS", label: "Tennis", icon: "🎾" },
  { value: "BADMINTON", label: "Badminton", icon: "🏸" },
  { value: "ATHLETICS", label: "Athletics", icon: "🏃" },
  { value: "FIELD_HOCKEY", label: "Field Hockey", icon: "🏑" },
  { value: "TABLE_TENNIS", label: "Table Tennis", icon: "🏓" },
  { value: "KABADDI", label: "Kabaddi", icon: "🤼" },
];

const VENUES = [
  "GROUND_1",
  "GROUND_2",
  "GROUND_3",
  "GROUND_4",
  "GROUND_5",
  "GROUND_6",
  "GROUND_7",
  "GROUND_8",
  "MAIN_STADIUM",
];

const ROUNDS = [
  { value: "POOL_STAGE", label: "Pool Stage" },
  { value: "ROUND_1", label: "Round 1" },
  { value: "ROUND_2", label: "Round 2" },
  { value: "ROUND_3", label: "Round 3" },
  { value: "ROUND_4", label: "Round 4" },
  { value: "ROUND_5", label: "Round 5" },
  { value: "ROUND_6", label: "Round 6" },
  { value: "ROUND_OF_32", label: "Round of 32" },
  { value: "ROUND_OF_16", label: "Round of 16" },
  { value: "PRE_QUARTER", label: "Pre-Quarter Final" },
  { value: "QUARTER_FINAL", label: "Quarter Final" },
  { value: "SEMI_FINAL", label: "Semi Final" },
  { value: "THIRD_PLACE", label: "Third Place" },
  { value: "FINAL", label: "Final" },
];

const POOLS = ["A", "B", "C", "D", "E", "F", "G", "H"];

const STATUSES = [
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "DELAYED", label: "Delayed" },
  { value: "POSTPONED", label: "Postponed" },
  { value: "CANCELLED", label: "Cancelled" },
];

/* ---- Schema ---- */

const matchFormSchema = z
  .object({
    tournamentId: z.string().min(1, "Tournament is required"),
    sport: z.string().min(1, "Sport is required"),
    gameId: z.string().min(1, "Please select a game"),
    name: z.string().max(200).optional().nullable(),
    venue: z.string().min(1, "Venue is required"),
    scheduledOn: z.date({ required_error: "Scheduled date/time is required" }),
    pool: z.string().optional().nullable(),
    round: z.string().min(1, "Round is required"),
    status: z.string().default("SCHEDULED"),
    sponsor: z.string().max(200).optional().nullable(),
    notes: z.string().max(2000).optional().nullable(),
    team1Id: z.string().min(1, "Team 1 is required"),
    team1Name: z.string().min(1, "Team 1 name is required"),
    team2Id: z.string().min(1, "Team 2 is required"),
    team2Name: z.string().min(1, "Team 2 name is required"),
  })
  .refine((d) => d.team1Id !== d.team2Id, {
    message: "Team 1 and Team 2 must be different",
    path: ["team2Id"],
  });

/* ---- TeamCombobox ---- */

function TeamCombobox({
  label,
  value,
  onChange,
  families,
  loading,
  excludeId,
  error,
}) {
  const options = families
    .filter((f) => f.id !== excludeId)
    .map((family) => ({
      value: family.id,
      label: family.familyName,
    }));

  const selectedOption = options.find((opt) => opt.value === value) || null;

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: "48px",
      height: "48px",
      borderColor: error ? "#ef4444" : state.isFocused ? "#f97316" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 1px #f97316" : "none",
      "&:hover": { borderColor: state.isFocused ? "#f97316" : "#d1d5db" },
      cursor: "pointer",
    }),
    valueContainer: (provided) => ({
      ...provided,
      height: "48px",
      padding: "0 8px",
    }),
    input: (provided) => ({ ...provided, margin: "0px" }),
    indicatorSeparator: () => ({ display: "none" }),
    indicatorsContainer: (provided) => ({ ...provided, height: "48px" }),
    clearIndicator: (provided) => ({
      ...provided,
      cursor: "pointer",
      padding: "4px",
      "&:hover": { color: "#6b7280" },
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      cursor: "pointer",
      padding: "8px",
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "white",
      zIndex: 50,
      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    }),
    menuList: (provided) => ({
      ...provided,
      maxHeight: "220px",
      padding: 0,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#fed7aa"
        : state.isFocused
          ? "#ffedd5"
          : "white",
      color: "#1f2937",
      cursor: "pointer",
      padding: "8px 12px",
      "&:active": { backgroundColor: "#fed7aa" },
    }),
    placeholder: (provided) => ({ ...provided, color: "#9ca3af" }),
  };

  const formatOptionLabel = ({ label }) => (
    <div className="flex items-center gap-2">
      <span className="h-6 w-6 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
        {label.charAt(0)}
      </span>
      <span className="truncate">{label}</span>
    </div>
  );

  return (
    <div className="space-y-2">
      <Label>
        {label} <span className="text-red-500">*</span>
      </Label>
      <ReactSelect
        value={selectedOption}
        onChange={(option) => onChange(option ? option.value : null)}
        options={options}
        isLoading={loading}
        isDisabled={loading}
        isClearable
        isSearchable
        placeholder={
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4 shrink-0" />
            <span>{loading ? "Loading teams..." : `Search ${label}...`}</span>
          </div>
        }
        noOptionsMessage={() => "No team found"}
        styles={customStyles}
        formatOptionLabel={formatOptionLabel}
        components={{
          DropdownIndicator: (props) => (
            <div {...props.innerProps} className="px-2">
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            </div>
          ),
        }}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

/* ---- Game Select ---- */

function GameSelect({ games, loadingGames, value, onChange, error }) {
  const options = games.map((g) => ({
    value: g.id,
    label: g.name,
    sportType: g.sportType,
    category: g.category,
    format: g.format,
  }));

  const selectedOption = options.find((o) => o.value === value) || null;

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: "48px",
      borderColor: error ? "#ef4444" : state.isFocused ? "#f97316" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 1px #f97316" : "none",
      "&:hover": { borderColor: state.isFocused ? "#f97316" : "#d1d5db" },
      cursor: "pointer",
    }),
    valueContainer: (provided) => ({ ...provided, padding: "4px 8px" }),
    input: (provided) => ({ ...provided, margin: "0px" }),
    indicatorSeparator: () => ({ display: "none" }),
    clearIndicator: (provided) => ({
      ...provided,
      cursor: "pointer",
      padding: "4px",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      cursor: "pointer",
      padding: "8px",
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "white",
      zIndex: 50,
      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    }),
    menuList: (provided) => ({ ...provided, maxHeight: "240px", padding: 4 }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#fed7aa"
        : state.isFocused
          ? "#ffedd5"
          : "white",
      color: "#1f2937",
      cursor: "pointer",
      borderRadius: "6px",
      padding: "8px 10px",
      "&:active": { backgroundColor: "#fed7aa" },
    }),
    placeholder: (provided) => ({ ...provided, color: "#9ca3af" }),
  };

  const formatOptionLabel = ({ label, sportType, category, format }) => (
    <div className="flex flex-col gap-0.5">
      <span className="font-medium text-sm text-gray-800">{label}</span>
      <div className="flex items-center gap-1.5 flex-wrap">
        {sportType && (
          <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-medium">
            {sportType.replace(/_/g, " ")}
          </span>
        )}
        {category && (
          <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">
            {category}
          </span>
        )}
        {format && (
          <span className="text-[10px] text-gray-400">{format}</span>
        )}
      </div>
    </div>
  );

  // Compact single-value display
  const formatSingleValue = ({ data }) => (
    <div className="flex items-center gap-2">
      <Trophy className="h-3.5 w-3.5 text-orange-500 shrink-0" />
      <span className="text-sm font-medium text-gray-800 truncate">
        {data.label}
      </span>
      {data.category && (
        <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded shrink-0">
          {data.category}
        </span>
      )}
    </div>
  );

  return (
    <div className="space-y-2">
      <Label>
        Tournament Game <span className="text-red-500">*</span>
      </Label>
      <ReactSelect
        value={selectedOption}
        onChange={(opt) => onChange(opt ? opt.value : "")}
        options={options}
        isLoading={loadingGames}
        isDisabled={loadingGames}
        isClearable
        isSearchable
        placeholder={
          <div className="flex items-center gap-2 text-muted-foreground">
            <Trophy className="h-4 w-4 shrink-0" />
            <span>
              {loadingGames ? "Loading games…" : "Select tournament game…"}
            </span>
          </div>
        }
        noOptionsMessage={() => "No games found"}
        styles={customStyles}
        formatOptionLabel={formatOptionLabel}
        formatValueLabel={formatSingleValue}
        components={{
          SingleValue: formatSingleValue,
          DropdownIndicator: (props) => (
            <div {...props.innerProps} className="px-2">
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            </div>
          ),
        }}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

/* ---- VS Preview Strip ---- */

function VsDivider({ team1Name, team2Name }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-orange-50 via-slate-50 to-orange-50 border border-orange-100">
      <div className="flex-1 text-right min-w-0">
        <span
          className={cn(
            "font-semibold text-sm truncate block",
            team1Name ? "text-slate-800" : "text-slate-400 italic",
          )}
        >
          {team1Name || "Team 1"}
        </span>
      </div>
      <div className="flex items-center justify-center h-9 w-9 rounded-full bg-gradient-to-br from-orange-500 to-red-600 shadow-sm shrink-0">
        <Swords className="h-4 w-4 text-white" />
      </div>
      <div className="flex-1 text-left min-w-0">
        <span
          className={cn(
            "font-semibold text-sm truncate block",
            team2Name ? "text-slate-800" : "text-slate-400 italic",
          )}
        >
          {team2Name || "Team 2"}
        </span>
      </div>
    </div>
  );
}

/* ---- Main Component ---- */

export function MatchForm({
  onSubmit,
  onCancel,
  loading,
  initialData = null,
  tournamentId,
  games = [],
  loadingGames = false,
}) {
  const [formData, setFormData] = useState({
    tournamentId: initialData?.tournamentId || tournamentId || "",
    sport: initialData?.sport || "",
    gameId: initialData?.tournamentGameId || initialData?.gameId || "",
    name: initialData?.name || "",
    venue: initialData?.venue || "",
    scheduledOn: initialData?.scheduledOn
      ? new Date(initialData.scheduledOn)
      : null,
    scheduledTime: initialData?.scheduledOn
      ? format(new Date(initialData.scheduledOn), "HH:mm")
      : "09:00",
    pool: initialData?.pool || null,
    round: initialData?.round || "",
    status: initialData?.status || "SCHEDULED",
    sponsor: initialData?.sponsor || "",
    notes: initialData?.notes || "",
    team1Id: initialData?.participants?.[0]?.teamId || "",
    team2Id: initialData?.participants?.[1]?.teamId || "",
    team1Name: initialData?.participants?.[0]?.teamName || "",
    team2Name: initialData?.participants?.[1]?.teamName || "",
  });

  const [errors, setErrors] = useState({});
  const { families, loading: loadingFamilies } = useFamilies({ limit: 1000 });

  const isPoolStage = formData.round === "POOL_STAGE";
  const team1 = families.find((f) => f.id === formData.team1Id);
  const team2 = families.find((f) => f.id === formData.team2Id);

  // When a game is selected, auto-fill sport if not already set
  const handleGameChange = (gameId) => {
    handleChange("gameId", gameId);
    if (gameId && !formData.sport) {
      const selectedGame = games.find((g) => g.id === gameId);
      if (selectedGame?.sportType) {
        handleChange("sport", selectedGame.sportType);
      }
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      let scheduledOn = null;
      if (formData.scheduledOn) {
        const [h, m] = (formData.scheduledTime || "00:00")
          .split(":")
          .map(Number);
        const dt = new Date(formData.scheduledOn);
        dt.setHours(h, m, 0, 0);
        scheduledOn = dt;
      }

      const dataToValidate = {
        ...formData,
        scheduledOn,
        name: formData.name || null,
        pool: formData.pool || null,
        sponsor: formData.sponsor || null,
        notes: formData.notes || null,
      };

      const validated = matchFormSchema.parse(dataToValidate);
      const { team1Id, team2Id, team1Name, team2Name, ...matchFields } =
        validated;

      await onSubmit({
        ...matchFields,
        scheduledOn: validated.scheduledOn.toISOString(),
        participants: [
          { teamId: team1Id, teamName: team1Name, order: 1 },
          { teamId: team2Id, teamName: team2Name, order: 2 },
        ],
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">

        {/* ── TOURNAMENT GAME ── */}
        <div className="md:col-span-2">
          <GameSelect
            games={games}
            loadingGames={loadingGames}
            value={formData.gameId}
            onChange={handleGameChange}
            error={errors.gameId}
          />
        </div>

        {/* ── TEAMS ── */}
        <div className="md:col-span-2 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Participating Teams
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <TeamCombobox
              label="Team 1"
              value={formData.team1Id}
              onChange={(v) => {
                handleChange("team1Id", v);
                const family = families.find((f) => f.id === v);
                handleChange("team1Name", family?.familyName || "");
              }}
              families={families}
              loading={loadingFamilies}
              excludeId={formData.team2Id}
              error={errors.team1Id}
            />
            <TeamCombobox
              label="Team 2"
              value={formData.team2Id}
              onChange={(v) => {
                handleChange("team2Id", v);
                const family = families.find((f) => f.id === v);
                handleChange("team2Name", family?.familyName || "");
              }}
              families={families}
              loading={loadingFamilies}
              excludeId={formData.team1Id}
              error={errors.team2Id}
            />
          </div>
          <VsDivider
            team1Name={team1?.familyName}
            team2Name={team2?.familyName}
          />
        </div>

        {/* ── MATCH DETAILS ── */}
        <div className="md:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Match Details
          </p>
        </div>

        {/* Sport */}
        <div className="space-y-2">
          <Label>
            Sport <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.sport}
            onValueChange={(v) => handleChange("sport", v)}
          >
            <SelectTrigger
              className={`h-12 ${errors.sport ? "border-red-500" : ""}`}
            >
              <SelectValue placeholder="Select sport" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {SPORT_TYPES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  <span className="flex items-center gap-2">
                    <span>{s.icon}</span>
                    <span>{s.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.sport && (
            <p className="text-sm text-red-500">{errors.sport}</p>
          )}
        </div>

        {/* Round */}
        <div className="space-y-2">
          <Label>
            Round <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.round}
            onValueChange={(v) => handleChange("round", v)}
          >
            <SelectTrigger
              className={`h-12 ${errors.round ? "border-red-500" : ""}`}
            >
              <SelectValue placeholder="Select round" />
            </SelectTrigger>
            <SelectContent className="bg-white max-h-72">
              {ROUNDS.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.round && (
            <p className="text-sm text-red-500">{errors.round}</p>
          )}
        </div>

        {/* Pool — only for POOL_STAGE */}
        {isPoolStage && (
          <div className="space-y-2">
            <Label>Pool</Label>
            <Select
              value={formData.pool || "none"}
              onValueChange={(v) =>
                handleChange("pool", v === "none" ? null : v)
              }
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select pool" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="none">None</SelectItem>
                {POOLS.map((p) => (
                  <SelectItem key={p} value={p}>
                    Pool {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Venue */}
        <div className="space-y-2">
          <Label>
            Venue <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.venue}
            onValueChange={(v) => handleChange("venue", v)}
          >
            <SelectTrigger
              className={`h-12 ${errors.venue ? "border-red-500" : ""}`}
            >
              <SelectValue placeholder="Select venue" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {VENUES.map((v) => (
                <SelectItem key={v} value={v}>
                  {v.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.venue && (
            <p className="text-sm text-red-500">{errors.venue}</p>
          )}
        </div>

        {/* Scheduled Date */}
        <div className="space-y-2">
          <Label>
            Scheduled Date <span className="text-red-500">*</span>
          </Label>
          <Input
            type="date"
            value={
              formData.scheduledOn
                ? new Date(formData.scheduledOn).toISOString().split("T")[0]
                : ""
            }
            onChange={(e) => {
              const date = e.target.value
                ? new Date(e.target.value).toISOString()
                : "";
              handleChange("scheduledOn", date);
            }}
            className={`h-12 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 block w-full bg-black/5 [color-scheme:light] ${
              errors.scheduledOn ? "border-red-500" : ""
            }`}
          />
          {errors.scheduledOn && (
            <p className="text-sm text-red-500">{errors.scheduledOn}</p>
          )}
        </div>

        {/* Scheduled Time */}
        <div className="space-y-2">
          <Label>
            Scheduled Time <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="time"
              value={formData.scheduledTime}
              onChange={(e) => handleChange("scheduledTime", e.target.value)}
              className="h-12 pl-9 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label>Initial Status</Label>
          <Select
            value={formData.status}
            onValueChange={(v) => handleChange("status", v)}
          >
            <SelectTrigger className="h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Match Name */}
        <div className="space-y-2 md:col-span-2">
          <Label>
            Match Name{" "}
            <span className="text-muted-foreground text-xs">
              (optional — auto-generated if blank)
            </span>
          </Label>
          <Input
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="e.g., Football - Pool A - Match 3"
            className="h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
          />
        </div>

        {/* Sponsor */}
        <div className="space-y-2">
          <Label>Sponsor</Label>
          <Input
            value={formData.sponsor}
            onChange={(e) => handleChange("sponsor", e.target.value)}
            placeholder="Sponsor name"
            className="h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
          />
        </div>

        {/* Notes */}
        <div className="space-y-2 md:col-span-2">
          <Label>Notes</Label>
          <Textarea
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder="Any additional notes..."
            rows={3}
            className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Actions */}
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
          disabled={loading || loadingFamilies}
          className="bg-orange-500 hover:bg-orange-600"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? "Update" : "Create"} Match
        </Button>
      </div>
    </form>
  );
}