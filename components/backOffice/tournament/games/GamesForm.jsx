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
import { ScrollArea } from "@/components/ui/scroll-area";

// Icons
import { Loader2, CalendarClock, Info, IndianRupee } from "lucide-react";
import { Separator } from "@/components/ui/separator";

/* ═══════════════════════════════════════════════════════════════════════════
   CONFIGURATION - Sport Types, Categories, Icons
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
  console.log(open);

  const [formData, setFormData] = useState({
    sportType: game?.sportType || "",
    name: game?.name || "",
    format: game?.format || "",
    category: game?.category || "",
    date: game?.date ? format(new Date(game.date), "yyyy-MM-dd") : "",
    registrationDeadline: game?.registrationDeadline
      ? format(new Date(game.registrationDeadline), "yyyy-MM-dd")
      : "",
    registrationFee: game?.registrationFee ?? "",
    icon: game?.icon || "",
    description: game?.description || "",
    rules: game?.rules || "",
    isActive: game?.isActive !== undefined ? game.isActive : true,
  });

  const [errors, setErrors] = useState({});

  // Reset form when dialog opens/closes
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
        registrationFee: game.registrationFee,
        icon: game.icon || "",
        description: game.description || "",
        rules: game.rules || "",
        isActive: game.isActive !== undefined ? game.isActive : true,
      });
    } else if (open && !game) {
      setFormData({
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
      });
    }
    setErrors({});
  }, [open, game]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.sportType) newErrors.sportType = "Sport type is required";
    if (!formData.name?.trim()) newErrors.name = "Game name is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.date) newErrors.date = "Game date is required";
    if (!formData.registrationDeadline)
      newErrors.registrationDeadline = "Registration deadline is required";
    if (formData.registrationDeadline && formData.date) {
      if (new Date(formData.registrationDeadline) >= new Date(formData.date)) {
        newErrors.registrationDeadline =
          "Deadline must be before the game date";
      }
    }
    if (formData.registrationFee === "" || formData.registrationFee === null) {
      newErrors.registrationFee = "Registration fee is required";
    } else if (
      isNaN(Number(formData.registrationFee)) ||
      Number(formData.registrationFee) < 0
    ) {
      newErrors.registrationFee = "Fee must be a valid non-negative number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

      const method = isEditing ? "PATCH" : "POST";

      // Prepare payload with proper type conversions
      const payload = {
        sportType: formData.sportType,
        name: formData.name.trim(),
        format: formData.format || null,
        category: formData.category,
        date: new Date(formData.date).toISOString(),
        registrationDeadline: new Date(
          formData.registrationDeadline,
        ).toISOString(),
        registrationFee: parseFloat(formData.registrationFee), // or Number()
        icon: formData.icon || null,
        description: formData.description || null,
        rules: formData.rules || null,
        isActive: formData.isActive,
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to save game");
      }

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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-scroll flex flex-col bg-slate-50">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Game" : "Create New Game"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the game details below"
              : "Add a new game/event to your tournament"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1  flex flex-col">
          <div className="space-y-4 py-4">
            {/* Sport Type */}
            <div className="space-y-2">
              <Label htmlFor="sportType">
                Sport Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.sportType}
                onValueChange={(value) => handleChange("sportType", value)}
              >
                <SelectTrigger
                  id="sportType"
                  className={errors.sportType ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select sport..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SPORT_TYPES).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center gap-2">
                        <span>{config.icon}</span>
                        <span>{config.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.sportType && (
                <p className="text-sm text-red-500">{errors.sportType}</p>
              )}
            </div>

            {/* Game Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Game Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g., Men's 7s Tournament"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleChange("category", value)}
              >
                <SelectTrigger
                  id="category"
                  className={errors.category ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select category..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(GAME_CATEGORIES).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center gap-2">
                        <span>{config.icon}</span>
                        <span>{config.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-500">{errors.category}</p>
              )}
            </div>

            {/* Format and Date - Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="format">Format</Label>
                <Select
                  value={formData.format}
                  onValueChange={(value) => handleChange("format", value)}
                >
                  <SelectTrigger id="format">
                    <SelectValue placeholder="Select format..." />
                  </SelectTrigger>
                  <SelectContent>
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
                    placeholder="Enter custom format"
                    value={formData.format !== "custom" ? formData.format : ""}
                    onChange={(e) => handleChange("format", e.target.value)}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">
                  Game Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                  className={errors.date ? "border-red-500" : ""}
                />
                {errors.date && (
                  <p className="text-sm text-red-500">{errors.date}</p>
                )}
              </div>
            </div>

            {/* Registration Section */}
            <Separator />
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">
                Registration
              </h3>
              <p className="text-xs text-muted-foreground">
                Set the fee and deadline for team registrations
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Registration Fee */}
              <div className="space-y-2">
                <Label htmlFor="registrationFee">
                  Registration Fee (₹) <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="registrationFee"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.registrationFee}
                    onChange={(e) =>
                      handleChange("registrationFee", e.target.value)
                    }
                    placeholder="0.00"
                    className={`pl-9 ${errors.registrationFee ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.registrationFee ? (
                  <p className="text-sm text-red-500">
                    {errors.registrationFee}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Enter 0 for free registration
                  </p>
                )}
              </div>

              {/* Registration Deadline */}
              <div className="space-y-2">
                <Label htmlFor="registrationDeadline">
                  Registration Deadline <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <CalendarClock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="registrationDeadline"
                    type="date"
                    value={formData.registrationDeadline}
                    max={formData.date || undefined}
                    onChange={(e) =>
                      handleChange("registrationDeadline", e.target.value)
                    }
                    className={`pl-9 ${errors.registrationDeadline ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.registrationDeadline ? (
                  <p className="text-sm text-red-500">
                    {errors.registrationDeadline}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Must be before the game date
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Icon */}
            <div className="space-y-2">
              <Label htmlFor="icon">Icon (Emoji)</Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) => handleChange("icon", e.target.value)}
                placeholder="🏆 (optional - uses sport default if empty)"
                maxLength={2}
              />
              <p className="text-xs text-muted-foreground">
                Choose an emoji to represent this game
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Brief description of the game..."
                rows={3}
              />
            </div>

            {/* Rules */}
            <div className="space-y-2">
              <Label htmlFor="rules">Rules</Label>
              <Textarea
                id="rules"
                value={formData.rules}
                onChange={(e) => handleChange("rules", e.target.value)}
                placeholder="Special rules or regulations for this game..."
                rows={4}
              />
            </div>

            {/* Active Status */}
            <div
              className={`flex items-center justify-between rounded-lg border p-4 ${
                formData.isActive
                  ? "border-green-200 bg-green-50"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="space-y-0.5">
                <Label
                  htmlFor="isActive"
                  className="text-sm font-medium cursor-pointer"
                >
                  {formData.isActive
                    ? "✅ Game is Active"
                    : "⏸️ Game is Inactive"}
                </Label>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
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
              />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
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
