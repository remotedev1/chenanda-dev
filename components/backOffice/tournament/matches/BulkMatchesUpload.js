"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Plus,
  Trash2,
  Swords,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCheck,
  AlertCircle,
  Loader2,
  Settings2,
  ClipboardList,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useFamilies } from "@/hooks/useFamily";
import ReactSelect from "react-select";

/* ── Constants ── */

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

/* ── Helpers ── */

const newMatch = (defaults = {}) => ({
  id: crypto.randomUUID(),
  team1Id: "",
  team1Name: "",
  team2Id: "",
  team2Name: "",
  sport: "",
  round: "",
  pool: null,
  venue: "",
  scheduledDate: "",
  scheduledTime: "09:00",
  status: "SCHEDULED",
  errors: {},
  collapsed: false,
});

// Resolve effective value: global wins if set
const resolve = (defaults, match, field) => {
  if (field === "pool") {
    return defaults.pool !== null && defaults.pool !== undefined
      ? defaults.pool
      : match.pool;
  }
  return defaults[field] || match[field];
};

const validate = (match, defaults) => {
  const errs = {};
  if (!match.team1Id) errs.team1Id = "Required";
  if (!match.team2Id) errs.team2Id = "Required";
  if (match.team1Id && match.team1Id === match.team2Id)
    errs.team2Id = "Must differ from Team 1";
  if (!resolve(defaults, match, "sport")) errs.sport = "Required";
  if (!resolve(defaults, match, "round")) errs.round = "Required";
  if (!resolve(defaults, match, "venue")) errs.venue = "Required";
  if (!resolve(defaults, match, "scheduledDate"))
    errs.scheduledDate = "Required";
  return errs;
};

const teamSelectStyles = (error) => ({
  control: (p, s) => ({
    ...p,
    minHeight: "40px",
    height: "40px",
    fontSize: "13px",
    borderColor: error ? "#ef4444" : s.isFocused ? "#f97316" : "#e5e7eb",
    boxShadow: s.isFocused ? "0 0 0 1px #f97316" : "none",
    "&:hover": { borderColor: s.isFocused ? "#f97316" : "#e5e7eb" },
    cursor: "pointer",
    borderRadius: "8px",
  }),
  valueContainer: (p) => ({ ...p, height: "40px", padding: "0 8px" }),
  input: (p) => ({ ...p, margin: 0, fontSize: "13px" }),
  indicatorSeparator: () => ({ display: "none" }),
  indicatorsContainer: (p) => ({ ...p, height: "40px" }),
  clearIndicator: (p) => ({ ...p, cursor: "pointer", padding: "4px" }),
  dropdownIndicator: (p) => ({ ...p, cursor: "pointer", padding: "6px" }),
  menu: (p) => ({
    ...p,
    backgroundColor: "white",
    zIndex: 100,
    boxShadow: "0 10px 25px -5px rgba(0,0,0,.12)",
    borderRadius: "10px",
  }),
  menuList: (p) => ({ ...p, maxHeight: "180px", padding: "4px" }),
  option: (p, s) => ({
    ...p,
    fontSize: "13px",
    borderRadius: "6px",
    backgroundColor: s.isSelected
      ? "#fed7aa"
      : s.isFocused
        ? "#fff7ed"
        : "white",
    color: "#1f2937",
    cursor: "pointer",
    padding: "6px 10px",
    "&:active": { backgroundColor: "#fed7aa" },
  }),
  placeholder: (p) => ({ ...p, color: "#9ca3af", fontSize: "13px" }),
});

/* ── Locked field display ── */
function LockedField({ value }) {
  return (
    <div className="h-10 flex items-center gap-1.5 px-3 rounded-lg bg-orange-50 border border-orange-200 text-orange-700 text-xs font-medium select-none">
      <Lock className="h-3 w-3 shrink-0 opacity-60" />
      <span className="truncate">{value}</span>
    </div>
  );
}

/* ── Defaults Panel ── */

function DefaultsPanel({ defaults, onChange }) {
  const sport = SPORT_TYPES.find((s) => s.value === defaults.sport);
  const hasAny =
    defaults.sport ||
    defaults.round ||
    defaults.pool ||
    defaults.venue ||
    defaults.scheduledDate;

  return (
    <div className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-7 w-7 rounded-lg bg-orange-500 flex items-center justify-center shrink-0">
          <Settings2 className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-orange-900">
            Global Defaults
          </p>
          <p className="text-xs text-orange-600">
            Set once here — those fields will be <strong>locked</strong> in
            every match row automatically
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Sport */}
        <div className="space-y-1">
          <Label className="text-xs text-orange-800 font-medium">Sport</Label>
          <Select
            value={defaults.sport || "__none__"}
            onValueChange={(v) => onChange("sport", v === "__none__" ? "" : v)}
          >
            <SelectTrigger className="h-9 text-xs bg-white border-orange-200 focus:border-orange-400 focus:ring-orange-400">
              <SelectValue placeholder="No default" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="__none__">— No default —</SelectItem>
              {SPORT_TYPES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.icon} {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Round */}
        <div className="space-y-1">
          <Label className="text-xs text-orange-800 font-medium">Round</Label>
          <Select
            value={defaults.round || "__none__"}
            onValueChange={(v) => onChange("round", v === "__none__" ? "" : v)}
          >
            <SelectTrigger className="h-9 text-xs bg-white border-orange-200 focus:border-orange-400 focus:ring-orange-400">
              <SelectValue placeholder="No default" />
            </SelectTrigger>
            <SelectContent className="bg-white max-h-64">
              <SelectItem value="__none__">— No default —</SelectItem>
              {ROUNDS.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Pool */}
        <div className="space-y-1">
          <Label className="text-xs text-orange-800 font-medium">Pool</Label>
          <Select
            value={
              defaults.pool !== null && defaults.pool !== undefined
                ? defaults.pool
                : "__none__"
            }
            onValueChange={(v) => onChange("pool", v === "__none__" ? null : v)}
          >
            <SelectTrigger className="h-9 text-xs bg-white border-orange-200 focus:border-orange-400 focus:ring-orange-400">
              <SelectValue placeholder="No default" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="__none__">— No default —</SelectItem>
              {POOLS.map((p) => (
                <SelectItem key={p} value={p}>
                  Pool {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Venue */}
        <div className="space-y-1">
          <Label className="text-xs text-orange-800 font-medium">Venue</Label>
          <Select
            value={defaults.venue || "__none__"}
            onValueChange={(v) => onChange("venue", v === "__none__" ? "" : v)}
          >
            <SelectTrigger className="h-9 text-xs bg-white border-orange-200 focus:border-orange-400 focus:ring-orange-400">
              <SelectValue placeholder="No default" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="__none__">— No default —</SelectItem>
              {VENUES.map((v) => (
                <SelectItem key={v} value={v}>
                  {v.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Date — no time in globals */}
      <div className="mt-3 max-w-[200px] space-y-1">
        <Label className="text-xs text-orange-800 font-medium">Date</Label>
        <Input
          type="date"
          value={defaults.scheduledDate || ""}
          onChange={(e) => onChange("scheduledDate", e.target.value)}
          className="h-9 text-xs bg-white border-orange-200 focus:border-orange-400 [color-scheme:light]"
        />
      </div>

      {/* Active locked chips */}
      {hasAny && (
        <div className="mt-3 flex flex-wrap gap-1.5 items-center">
          <span className="text-[11px] text-orange-700 font-semibold uppercase tracking-wide mr-1">
            Locked in all rows:
          </span>
          {defaults.sport && (
            <Badge className="bg-orange-500 text-white text-[11px] h-5 gap-1 border-0">
              <Lock className="h-2.5 w-2.5" />
              {sport?.icon} {sport?.label}
            </Badge>
          )}
          {defaults.round && (
            <Badge className="bg-orange-500 text-white text-[11px] h-5 gap-1 border-0">
              <Lock className="h-2.5 w-2.5" />
              {ROUNDS.find((r) => r.value === defaults.round)?.label}
            </Badge>
          )}
          {defaults.pool && (
            <Badge className="bg-orange-500 text-white text-[11px] h-5 gap-1 border-0">
              <Lock className="h-2.5 w-2.5" />
              Pool {defaults.pool}
            </Badge>
          )}
          {defaults.venue && (
            <Badge className="bg-orange-500 text-white text-[11px] h-5 gap-1 border-0">
              <Lock className="h-2.5 w-2.5" />
              {defaults.venue.replace(/_/g, " ")}
            </Badge>
          )}
          {defaults.scheduledDate && (
            <Badge className="bg-orange-500 text-white text-[11px] h-5 gap-1 border-0">
              <Lock className="h-2.5 w-2.5" />
              {defaults.scheduledDate}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Single Match Row ── */

function MatchRow({
  match,
  index,
  families,
  loadingFamilies,
  onChange,
  onRemove,
  onDuplicate,
  totalMatches,
  defaults,
}) {
  const sportLocked = !!defaults.sport;
  const roundLocked = !!defaults.round;
  const poolLocked = defaults.pool !== null && defaults.pool !== undefined;
  const venueLocked = !!defaults.venue;
  const dateLocked = !!defaults.scheduledDate;

  const effectiveSport = defaults.sport || match.sport;
  const effectiveRound = defaults.round || match.round;
  const effectivePool = poolLocked ? defaults.pool : match.pool;
  const effectiveVenue = defaults.venue || match.venue;
  const effectiveDate = defaults.scheduledDate || match.scheduledDate;

  const isPoolStage = effectiveRound === "POOL_STAGE";
  const hasErrors = Object.keys(match.errors).length > 0;
  const isValid =
    !hasErrors &&
    match.team1Id &&
    match.team2Id &&
    effectiveSport &&
    effectiveRound &&
    effectiveVenue &&
    effectiveDate;

  const sport = SPORT_TYPES.find((s) => s.value === effectiveSport);
  const team1 = families.find((f) => f.id === match.team1Id);
  const team2 = families.find((f) => f.id === match.team2Id);

  const teamOptions = (excludeId) =>
    families
      .filter((f) => f.id !== excludeId)
      .map((f) => ({ value: f.id, label: f.familyName }));

  return (
    <div
      className={cn(
        "rounded-2xl border transition-all duration-200",
        hasErrors
          ? "border-red-200 bg-red-50/30"
          : isValid
            ? "border-green-200 bg-green-50/20"
            : "border-gray-200 bg-white",
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div
          className={cn(
            "h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
            hasErrors
              ? "bg-red-100 text-red-700"
              : isValid
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600",
          )}
        >
          {hasErrors ? <AlertCircle className="h-4 w-4" /> : index + 1}
        </div>

        <div className="flex-1 min-w-0">
          {team1 || team2 ? (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-semibold text-gray-800 truncate max-w-[120px]">
                {team1?.familyName || "Team 1"}
              </span>
              <Swords className="h-3 w-3 text-orange-400 shrink-0" />
              <span className="text-sm font-semibold text-gray-800 truncate max-w-[120px]">
                {team2?.familyName || "Team 2"}
              </span>
              {sport && <span className="text-xs">{sport.icon}</span>}
              {effectiveDate && (
                <span className="text-xs text-gray-500 ml-1">
                  {effectiveDate} · {match.scheduledTime}
                </span>
              )}
            </div>
          ) : (
            <span className="text-sm text-gray-400 italic">
              Match #{index + 1} — pick teams below
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-gray-400 hover:text-orange-500"
                  onClick={() => onDuplicate(match.id)}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-slate-800 text-slate-300 h-6 rounded-md">
                <p>Duplicate match</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {totalMatches > 1 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-gray-400 hover:text-red-500"
                    onClick={() => onRemove(match.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-slate-800 text-slate-300 h-6 rounded-md">
                  <p>Remove</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-gray-400"
            onClick={() => onChange(match.id, "collapsed", !match.collapsed)}
          >
            {match.collapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Fields */}
      {!match.collapsed && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
          {/* Teams */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-600">
                Team 1 <span className="text-red-400">*</span>
              </Label>
              <ReactSelect
                value={
                  teamOptions(match.team2Id).find(
                    (o) => o.value === match.team1Id,
                  ) || null
                }
                onChange={(opt) => {
                  const fam = families.find((f) => f.id === opt?.value);
                  onChange(match.id, "team1Id", opt?.value || "");
                  onChange(match.id, "team1Name", fam?.familyName || "");
                }}
                options={teamOptions(match.team2Id)}
                isLoading={loadingFamilies}
                isClearable
                isSearchable
                placeholder="Search team…"
                noOptionsMessage={() => "No team found"}
                styles={teamSelectStyles(match.errors.team1Id)}
              />
              {match.errors.team1Id && (
                <p className="text-[11px] text-red-500">
                  {match.errors.team1Id}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-600">
                Team 2 <span className="text-red-400">*</span>
              </Label>
              <ReactSelect
                value={
                  teamOptions(match.team1Id).find(
                    (o) => o.value === match.team2Id,
                  ) || null
                }
                onChange={(opt) => {
                  const fam = families.find((f) => f.id === opt?.value);
                  onChange(match.id, "team2Id", opt?.value || "");
                  onChange(match.id, "team2Name", fam?.familyName || "");
                }}
                options={teamOptions(match.team1Id)}
                isLoading={loadingFamilies}
                isClearable
                isSearchable
                placeholder="Search team…"
                noOptionsMessage={() => "No team found"}
                styles={teamSelectStyles(match.errors.team2Id)}
              />
              {match.errors.team2Id && (
                <p className="text-[11px] text-red-500">
                  {match.errors.team2Id}
                </p>
              )}
            </div>
          </div>

          {/* Other fields */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Sport */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                Sport <span className="text-red-400">*</span>
                {sportLocked && (
                  <Lock className="h-2.5 w-2.5 text-orange-400 ml-0.5" />
                )}
              </Label>
              {sportLocked ? (
                <LockedField value={`${sport?.icon} ${sport?.label}`} />
              ) : (
                <>
                  <Select
                    value={match.sport}
                    onValueChange={(v) => onChange(match.id, "sport", v)}
                  >
                    <SelectTrigger
                      className={cn(
                        "h-10 text-xs",
                        match.errors.sport && "border-red-400",
                      )}
                    >
                      <SelectValue placeholder="Select sport" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {SPORT_TYPES.map((s) => (
                        <SelectItem
                          key={s.value}
                          value={s.value}
                          className="text-xs"
                        >
                          {s.icon} {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {match.errors.sport && (
                    <p className="text-[11px] text-red-500">
                      {match.errors.sport}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Round */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                Round <span className="text-red-400">*</span>
                {roundLocked && (
                  <Lock className="h-2.5 w-2.5 text-orange-400 ml-0.5" />
                )}
              </Label>
              {roundLocked ? (
                <LockedField
                  value={
                    ROUNDS.find((r) => r.value === effectiveRound)?.label ||
                    effectiveRound
                  }
                />
              ) : (
                <>
                  <Select
                    value={match.round}
                    onValueChange={(v) => onChange(match.id, "round", v)}
                  >
                    <SelectTrigger
                      className={cn(
                        "h-10 text-xs",
                        match.errors.round && "border-red-400",
                      )}
                    >
                      <SelectValue placeholder="Select round" />
                    </SelectTrigger>
                    <SelectContent className="bg-white max-h-60">
                      {ROUNDS.map((r) => (
                        <SelectItem
                          key={r.value}
                          value={r.value}
                          className="text-xs"
                        >
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {match.errors.round && (
                    <p className="text-[11px] text-red-500">
                      {match.errors.round}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Pool — only when POOL_STAGE */}
            {isPoolStage && (
              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                  Pool
                  {poolLocked && (
                    <Lock className="h-2.5 w-2.5 text-orange-400 ml-0.5" />
                  )}
                </Label>
                {poolLocked ? (
                  <LockedField
                    value={effectivePool ? `Pool ${effectivePool}` : "None"}
                  />
                ) : (
                  <Select
                    value={match.pool || "__none__"}
                    onValueChange={(v) =>
                      onChange(match.id, "pool", v === "__none__" ? null : v)
                    }
                  >
                    <SelectTrigger className="h-10 text-xs">
                      <SelectValue placeholder="Pool" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="__none__">— None —</SelectItem>
                      {POOLS.map((p) => (
                        <SelectItem key={p} value={p} className="text-xs">
                          Pool {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            {/* Venue */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                Venue <span className="text-red-400">*</span>
                {venueLocked && (
                  <Lock className="h-2.5 w-2.5 text-orange-400 ml-0.5" />
                )}
              </Label>
              {venueLocked ? (
                <LockedField value={effectiveVenue.replace(/_/g, " ")} />
              ) : (
                <>
                  <Select
                    value={match.venue}
                    onValueChange={(v) => onChange(match.id, "venue", v)}
                  >
                    <SelectTrigger
                      className={cn(
                        "h-10 text-xs",
                        match.errors.venue && "border-red-400",
                      )}
                    >
                      <SelectValue placeholder="Select venue" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {VENUES.map((v) => (
                        <SelectItem key={v} value={v} className="text-xs">
                          {v.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {match.errors.venue && (
                    <p className="text-[11px] text-red-500">
                      {match.errors.venue}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Date */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                Date <span className="text-red-400">*</span>
                {dateLocked && (
                  <Lock className="h-2.5 w-2.5 text-orange-400 ml-0.5" />
                )}
              </Label>
              {dateLocked ? (
                <LockedField value={effectiveDate} />
              ) : (
                <>
                  <Input
                    type="date"
                    value={match.scheduledDate}
                    onChange={(e) =>
                      onChange(match.id, "scheduledDate", e.target.value)
                    }
                    className={cn(
                      "h-10 text-xs [color-scheme:light]",
                      match.errors.scheduledDate && "border-red-400",
                    )}
                  />
                  {match.errors.scheduledDate && (
                    <p className="text-[11px] text-red-500">
                      {match.errors.scheduledDate}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Time — always per-match, never global */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-600">Time</Label>
              <Input
                type="time"
                value={match.scheduledTime}
                onChange={(e) =>
                  onChange(match.id, "scheduledTime", e.target.value)
                }
                className="h-10 text-xs"
              />
            </div>

            {/* Status */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-600">
                Status
              </Label>
              <Select
                value={match.status}
                onValueChange={(v) => onChange(match.id, "status", v)}
              >
                <SelectTrigger className="h-10 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {STATUSES.map((s) => (
                    <SelectItem
                      key={s.value}
                      value={s.value}
                      className="text-xs"
                    >
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main Component ── */

export function BulkMatchUpload({ onSubmit, onCancel, onDone, tournamentId }) {
  const [defaults, setDefaults] = useState({
    sport: "FIELD_HOCKEY",
    round: "",
    pool: null,
    venue: "",
    scheduledDate: "",
  });

  const [matches, setMatches] = useState([newMatch()]);
  const [submitting, setSubmitting] = useState(false);

  const { families, loading: loadingFamilies } = useFamilies({ limit: 1000 });

  const handleDefaultChange = useCallback((field, value) => {
    setDefaults((prev) => ({ ...prev, [field]: value }));
  }, []);

  const addMatch = () => {
    setMatches((prev) => [...prev, newMatch()]);
  };

  const removeMatch = (id) => {
    setMatches((prev) => prev.filter((m) => m.id !== id));
  };

  const duplicateMatch = (id) => {
    setMatches((prev) => {
      const idx = prev.findIndex((m) => m.id === id);
      const src = prev[idx];
      const dup = {
        ...src,
        id: crypto.randomUUID(),
        team1Id: "",
        team1Name: "",
        team2Id: "",
        team2Name: "",
        errors: {},
      };
      const next = [...prev];
      next.splice(idx + 1, 0, dup);
      return next;
    });
    toast.success("Match duplicated — pick teams for the new row");
  };

  const handleChange = (id, field, value) => {
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const updated = { ...m, [field]: value };
        if (updated.errors[field]) {
          const { [field]: _, ...rest } = updated.errors;
          updated.errors = rest;
        }
        return updated;
      }),
    );
  };

  const collapseAll = () =>
    setMatches((p) => p.map((m) => ({ ...m, collapsed: true })));
  const expandAll = () =>
    setMatches((p) => p.map((m) => ({ ...m, collapsed: false })));

  const handleSubmit = async (e) => {
    e.preventDefault();

    let hasErrors = false;
    const validated = matches.map((m) => {
      const errs = validate(m, defaults);
      if (Object.keys(errs).length) hasErrors = true;
      return {
        ...m,
        errors: errs,
        collapsed: Object.keys(errs).length > 0 ? false : m.collapsed,
      };
    });

    if (hasErrors) {
      setMatches(validated);
      toast.error("Please fix errors before submitting");
      return;
    }

    setSubmitting(true);
    try {
      const payload = validated.map((m) => {
        const [h, min] = m.scheduledTime.split(":").map(Number);
        const dateStr = defaults.scheduledDate || m.scheduledDate;
        const dt = new Date(dateStr);
        dt.setHours(h, min, 0, 0);

        return {
          tournamentId,
          sport: defaults.sport || m.sport,
          round: defaults.round || m.round,
          pool:
            defaults.pool !== null && defaults.pool !== undefined
              ? defaults.pool
              : m.pool,
          venue: defaults.venue || m.venue,
          status: m.status,
          scheduledOn: dt.toISOString(),
          participants: [
            { teamId: m.team1Id, teamName: m.team1Name, order: 1 },
            { teamId: m.team2Id, teamName: m.team2Name, order: 2 },
          ],
        };
      });

      await onSubmit(payload);

      onDone();
    } catch {
      toast.error("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const validCount = matches.filter(
    (m) => Object.keys(validate(m, defaults)).length === 0,
  ).length;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <DefaultsPanel defaults={defaults} onChange={handleDefaultChange} />

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-semibold text-gray-700">
            {matches.length} Match{matches.length > 1 ? "es" : ""}
          </span>
          <Badge
            variant="outline"
            className={cn(
              "text-xs",
              validCount === matches.length
                ? "border-green-300 text-green-700 bg-green-50"
                : "border-gray-300 text-gray-500",
            )}
          >
            {validCount}/{matches.length} ready
          </Badge>
        </div>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs h-8 text-gray-500"
            onClick={collapseAll}
          >
            <ChevronUp className="h-3.5 w-3.5 mr-1" /> Collapse all
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs h-8 text-gray-500"
            onClick={expandAll}
          >
            <ChevronDown className="h-3.5 w-3.5 mr-1" /> Expand all
          </Button>
        </div>
      </div>

      {/* Rows */}
      <div className="space-y-3">
        {matches.map((match, idx) => (
          <MatchRow
            key={match.id}
            match={match}
            index={idx}
            families={families}
            loadingFamilies={loadingFamilies}
            onChange={handleChange}
            onRemove={removeMatch}
            onDuplicate={duplicateMatch}
            totalMatches={matches.length}
            defaults={defaults}
          />
        ))}
      </div>

      {/* Add row */}
      <button
        type="button"
        onClick={addMatch}
        className="w-full h-12 rounded-2xl border-2 border-dashed border-orange-200 text-orange-500 hover:border-orange-400 hover:bg-orange-50 transition-all duration-150 flex items-center justify-center gap-2 text-sm font-medium"
      >
        <Plus className="h-4 w-4" />
        Add another match
      </button>

      {/* Footer */}
      <div className="flex gap-3 justify-between items-center pt-4 border-t">
        <p className="text-xs text-gray-500">
          {validCount === matches.length && matches.length > 0 ? (
            <span className="text-green-600 font-medium flex items-center gap-1">
              <CheckCheck className="h-3.5 w-3.5" />
              All matches ready
            </span>
          ) : (
            `${matches.length - validCount} match${matches.length - validCount !== 1 ? "es" : ""} still incomplete`
          )}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting || loadingFamilies}
            className="bg-orange-500 hover:bg-orange-600 min-w-[140px]"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <CheckCheck className="mr-2 h-4 w-4" />
                Submit {matches.length} Match{matches.length > 1 ? "es" : ""}
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
