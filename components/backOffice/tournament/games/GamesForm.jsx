"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "sonner";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

// Icons
import { Loader2, CalendarClock, Info, IndianRupee } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════
   CONFIGURATION
   ═══════════════════════════════════════════════════════════════════════════ */

export const SPORT_TYPES = {
  FIELD_HOCKEY: { label: "Field Hockey", icon: "🏑", color: "bg-blue-500" },
  FOOTBALL: { label: "Football", icon: "⚽", color: "bg-green-500" },
  CRICKET: { label: "Cricket", icon: "🏏", color: "bg-red-500" },
  BASKETBALL: { label: "Basketball", icon: "🏀", color: "bg-orange-500" },
  VOLLEYBALL: { label: "Volleyball", icon: "🏐", color: "bg-yellow-500" },
  BADMINTON: { label: "Badminton", icon: "🏸", color: "bg-purple-500" },
  TENNIS: { label: "Tennis", icon: "🎾", color: "bg-pink-500" },
  TABLE_TENNIS: { label: "Table Tennis", icon: "🏓", color: "bg-indigo-500" },
};

export const GAME_CATEGORIES = {
  MENS: { label: "Men's", icon: "👨", color: "text-blue-600" },
  WOMENS: { label: "Women's", icon: "👩", color: "text-pink-600" },
  JUNIOR: { label: "Junior", icon: "👦", color: "text-green-600" },
  VETERANS: { label: "Veterans", icon: "👴", color: "text-orange-600" },
  MIXED: { label: "Mixed", icon: "👥", color: "text-purple-600" },
};

export const COMMON_FORMATS = {
  FIELD_HOCKEY: ["7-a-side", "11-a-side", "5-a-side"],
  FOOTBALL: ["5-a-side", "7-a-side", "11-a-side", "Futsal"],
  CRICKET: ["T20", "One Day", "Test Match", "T10", "6-a-side"],
  BASKETBALL: ["5v5", "3v3", "Full Court", "Half Court"],
  VOLLEYBALL: ["6v6", "4v4", "Beach"],
  BADMINTON: ["Singles", "Doubles", "Mixed Doubles"],
  TENNIS: ["Singles", "Doubles", "Mixed Doubles"],
  TABLE_TENNIS: ["Singles", "Doubles", "Team"],
};

/* ═══════════════════════════════════════════════════════════════════════════
   FIELD WRAPPER — consistent label + error layout
   ═══════════════════════════════════════════════════════════════════════════ */

function Field({ label, required, error, hint, children }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <Label className="text-sm font-medium text-slate-700">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </Label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-red-500">{error}</p>
      ) : hint ? (
        <p className="text-xs text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   GAME FORM DIALOG
   ═══════════════════════════════════════════════════════════════════════════ */

export function GameFormDialog({
  open,
  onOpenChange,
  game,
  tournamentId,
  onSuccess,
}) {
  const isEditing = !!game;
  const [loading, setLoading] = useState(false);

  const defaultForm = {
    sportType: "",
    name: "",
    format: "",
    category: "",
    date: "",
    registrationDeadline: "",
    registrationFee: "",
    icon: "",
    description: "",
    rules: "",
    isActive: true,
  };

  const [formData, setFormData] = useState(defaultForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open && game) {
      setFormData({
        sportType: game.sportType || "",
        name: game.name || "",
        format: game.format || "",
        category: game.category || "",
        date: game.date ? format(new Date(game.date), "yyyy-MM-dd") : "",
        registrationDeadline: game.registrationDeadline
          ? format(new Date(game.registrationDeadline), "yyyy-MM-dd")
          : "",
        registrationFee: game.registrationFee ?? "",
        icon: game.icon || "",
        description: game.description || "",
        rules: game.rules || "",
        isActive: game.isActive !== undefined ? game.isActive : true,
      });
    } else if (open && !game) {
      setFormData(defaultForm);
    }
    setErrors({});
  }, [open, game]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const e = {};
    if (!formData.sportType) e.sportType = "Sport type is required";
    if (!formData.name?.trim()) e.name = "Game name is required";
    if (!formData.category) e.category = "Category is required";
    if (!formData.date) e.date = "Game date is required";
    if (!formData.registrationDeadline)
      e.registrationDeadline = "Registration deadline is required";
    if (
      formData.registrationDeadline &&
      formData.date &&
      new Date(formData.registrationDeadline) >= new Date(formData.date)
    ) {
      e.registrationDeadline = "Deadline must be before the game date";
    }
    if (formData.registrationFee === "" || formData.registrationFee === null) {
      e.registrationFee = "Registration fee is required";
    } else if (
      isNaN(Number(formData.registrationFee)) ||
      Number(formData.registrationFee) < 0
    ) {
      e.registrationFee = "Fee must be a valid non-negative number";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the errors in the form");
      return;
    }
    setLoading(true);
    try {
      const url = isEditing
        ? `/api/tournaments/${tournamentId}/games/${game.id}`
        : `/api/tournaments/${tournamentId}/games`;

      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sportType: formData.sportType,
          name: formData.name.trim(),
          format: formData.format || null,
          category: formData.category,
          date: new Date(formData.date).toISOString(),
          registrationDeadline: new Date(
            formData.registrationDeadline,
          ).toISOString(),
          registrationFee: parseFloat(formData.registrationFee),
          icon: formData.icon || null,
          description: formData.description || null,
          rules: formData.rules || null,
          isActive: formData.isActive,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success)
        throw new Error(result.error || "Failed to save game");

      toast.success(
        result.message ||
          `Game ${isEditing ? "updated" : "created"} successfully`,
      );
      onSuccess(result.data);
      onOpenChange(false);
    } catch (error) {
      console.error("Save game error:", error);
      toast.error(error.message || "Failed to save game");
    } finally {
      setLoading(false);
    }
  };

  const suggestedFormats = formData.sportType
    ? COMMON_FORMATS[formData.sportType] || []
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-slate-800">
            {isEditing ? "Edit Game" : "Create New Game"}
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            {isEditing
              ? "Update the game details below"
              : "Add a new game or event to your tournament"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-2">

          {/* Sport Type */}
          <Field label="Sport Type" required error={errors.sportType}>
            <Select
              value={formData.sportType}
              onValueChange={(v) => handleChange("sportType", v)}
            >
              <SelectTrigger
                className={`border-slate-200 bg-slate-50 ${errors.sportType ? "border-red-400" : ""}`}
              >
                <SelectValue placeholder="Select sport..." />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {Object.entries(SPORT_TYPES).map(([value, config]) => (
                  <SelectItem key={value} value={value}>
                    <span className="flex items-center gap-2">
                      <span>{config.icon}</span>
                      <span>{config.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {/* Game Name */}
          <Field label="Game Name" required error={errors.name}>
            <Input
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="e.g., Men's 7s Tournament"
              className={`border-slate-200 bg-slate-50 ${errors.name ? "border-red-400" : ""}`}
            />
          </Field>

          {/* Category */}
          <Field label="Category" required error={errors.category}>
            <Select
              value={formData.category}
              onValueChange={(v) => handleChange("category", v)}
            >
              <SelectTrigger
                className={`border-slate-200 bg-slate-50 ${errors.category ? "border-red-400" : ""}`}
              >
                <SelectValue placeholder="Select category..." />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {Object.entries(GAME_CATEGORIES).map(([value, config]) => (
                  <SelectItem key={value} value={value}>
                    <span className="flex items-center gap-2">
                      <span>{config.icon}</span>
                      <span>{config.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {/* Format + Date */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Format">
              <Select
                value={formData.format}
                onValueChange={(v) => handleChange("format", v)}
              >
                <SelectTrigger className="border-slate-200 bg-slate-50">
                  <SelectValue placeholder="Select format..." />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {suggestedFormats.map((fmt) => (
                    <SelectItem key={fmt} value={fmt}>
                      {fmt}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom...</SelectItem>
                </SelectContent>
              </Select>
              {formData.format === "custom" && (
                <Input
                  className="mt-2 border-slate-200 bg-slate-50"
                  placeholder="Enter custom format"
                  onChange={(e) => handleChange("format", e.target.value)}
                />
              )}
            </Field>

            <Field label="Game Date" required error={errors.date}>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
                className={`border-slate-200 bg-slate-50 ${errors.date ? "border-red-400" : ""}`}
              />
            </Field>
          </div>

          <Separator className="bg-slate-100" />

          {/* Registration Section */}
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-700">
              Registration
            </h3>
            <p className="text-xs text-slate-400">
              Set the fee and deadline for team registrations
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Registration Fee (₹)"
              required
              error={errors.registrationFee}
              hint="Enter 0 for free registration"
            >
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.registrationFee}
                  onChange={(e) =>
                    handleChange("registrationFee", e.target.value)
                  }
                  placeholder="0.00"
                  className={`pl-9 border-slate-200 bg-slate-50 ${errors.registrationFee ? "border-red-400" : ""}`}
                />
              </div>
            </Field>

            <Field
              label="Registration Deadline"
              required
              error={errors.registrationDeadline}
              hint="Must be before the game date"
            >
              <div className="relative">
                <CalendarClock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <Input
                  type="date"
                  value={formData.registrationDeadline}
                  max={formData.date || undefined}
                  onChange={(e) =>
                    handleChange("registrationDeadline", e.target.value)
                  }
                  className={`pl-9 border-slate-200 bg-slate-50 ${errors.registrationDeadline ? "border-red-400" : ""}`}
                />
              </div>
            </Field>
          </div>

          <Separator className="bg-slate-100" />

          {/* Icon */}
          <Field
            label="Icon (Emoji)"
            hint="Choose an emoji to represent this game"
          >
            <Input
              value={formData.icon}
              onChange={(e) => handleChange("icon", e.target.value)}
              placeholder="🏆 (optional — uses sport default if empty)"
              maxLength={2}
              className="border-slate-200 bg-slate-50"
            />
          </Field>

          {/* Description */}
          <Field label="Description">
            <Textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Brief description of the game..."
              rows={3}
              className="border-slate-200 bg-slate-50 resize-none"
            />
          </Field>

          {/* Rules */}
          <Field label="Rules">
            <Textarea
              value={formData.rules}
              onChange={(e) => handleChange("rules", e.target.value)}
              placeholder="Special rules or regulations for this game..."
              rows={4}
              className="border-slate-200 bg-slate-50 resize-none"
            />
          </Field>

          {/* Active Status */}
          <div
            className={`flex items-center justify-between rounded-lg border p-4 transition-colors ${
              formData.isActive
                ? "border-orange-200 bg-orange-50"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            <div className="space-y-0.5">
              <Label
                htmlFor="isActive"
                className="text-sm font-medium text-slate-700 cursor-pointer"
              >
                {formData.isActive ? "✅ Game is Active" : "⏸️ Game is Inactive"}
              </Label>
              <p className="flex items-center gap-1 text-xs text-slate-400">
                <Info className="h-3 w-3" />
                {formData.isActive
                  ? "Teams can register for this game"
                  : "Game is hidden from registration"}
              </p>
            </div>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleChange("isActive", checked)}
              className="data-[state=checked]:bg-orange-500"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update Game" : "Create Game"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default GameFormDialog;