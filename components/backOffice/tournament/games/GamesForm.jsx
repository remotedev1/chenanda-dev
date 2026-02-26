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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Loader2, Calendar as CalendarIcon } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const SPORT_TYPES = [
  "FOOTBALL",
  "BASKETBALL",
  "VOLLEYBALL",
  "CRICKET",
  "TENNIS",
  "BADMINTON",
  "ATHLETICS",
  "FIELD_HOCKEY",
  "TABLE_TENNIS",
  "KABADDI",
];

const CATEGORIES = ["MENS", "WOMENS", "JUNIOR", "VETERANS", "MIXED"];

const SPORT_ICONS = {
  FOOTBALL: "⚽",
  BASKETBALL: "🏀",
  VOLLEYBALL: "🏐",
  CRICKET: "🏏",
  TENNIS: "🎾",
  BADMINTON: "🏸",
  ATHLETICS: "🏃",
  FIELD_HOCKEY: "🏑",
  TABLE_TENNIS: "🏓",
  KABADDI: "🤼",
};

const createGameSchema = z.object({
  tournamentId: z.string().min(1, "Tournament is required"),
  sportType: z.string().min(1, "Sport type is required"),
  name: z
    .string()
    .min(2, "Game name must be at least 2 characters")
    .max(200, "Game name is too long"),
  format: z.string().max(100, "Format is too long").optional().nullable(),
  category: z.string().min(1, "Category is required"),
  date: z.date({ required_error: "Date is required" }),
  isActive: z.boolean().default(true),
  icon: z.string().max(10, "Icon is too long").optional().nullable(),
  description: z.string().max(2000, "Description is too long").optional().nullable(),
  rules: z.string().max(5000, "Rules is too long").optional().nullable(),
});

export function GameForm({
  onSubmit,
  onCancel,
  loading,
  initialData = null,
  tournamentId,
}) {
  const [formData, setFormData] = useState({
    tournamentId: initialData?.tournamentId || tournamentId || "",
    sportType: initialData?.sportType || "",
    name: initialData?.name || "",
    format: initialData?.format || "",
    category: initialData?.category || "",
    date: initialData?.date ? new Date(initialData.date) : null,
    isActive: initialData?.isActive ?? true,
    icon: initialData?.icon || "",
    description: initialData?.description || "",
    rules: initialData?.rules || "",
  });

  const [errors, setErrors] = useState({});
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    // Auto-set icon when sport changes
    if (field === "sportType" && !formData.icon) {
      setFormData((prev) => ({
        ...prev,
        sportType: value,
        icon: SPORT_ICONS[value] || "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      const dataToValidate = {
        ...formData,
        format: formData.format || null,
        icon: formData.icon || null,
        description: formData.description || null,
        rules: formData.rules || null,
      };

      const validated = createGameSchema.parse(dataToValidate);
      await onSubmit(validated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = {};
        error.errors.forEach((err) => {
          const field = err.path[0];
          fieldErrors[field] = err.message;
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
      <div className="grid gap-6 md:grid-cols-2">

        {/* Game Name */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="name">
            Game Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="e.g., Men's 7s Football Tournament"
            className={`h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500 ${
              errors.name ? "border-red-500 focus:ring-red-500" : ""
            }`}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        {/* Sport Type */}
        <div className="space-y-2">
          <Label htmlFor="sportType">
            Sport Type <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.sportType || ""}
            onValueChange={(value) => handleChange("sportType", value)}
          >
            <SelectTrigger
              className={`h-12 ${errors.sportType ? "border-red-500" : ""}`}
            >
              <SelectValue placeholder="Select sport" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {SPORT_TYPES.map((sport) => (
                <SelectItem key={sport} value={sport}>
                  <span className="flex items-center gap-2">
                    <span>{SPORT_ICONS[sport]}</span>
                    <span>{sport.replace(/_/g, " ")}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.sportType && (
            <p className="text-sm text-red-500">{errors.sportType}</p>
          )}
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">
            Category <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.category || ""}
            onValueChange={(value) => handleChange("category", value)}
          >
            <SelectTrigger
              className={`h-12 ${errors.category ? "border-red-500" : ""}`}
            >
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0) + cat.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-red-500">{errors.category}</p>
          )}
        </div>

        {/* Format */}
        <div className="space-y-2">
          <Label htmlFor="format">Format</Label>
          <Input
            id="format"
            value={formData.format}
            onChange={(e) => handleChange("format", e.target.value)}
            placeholder="e.g., 7-a-side, T20, 5s League"
            className="h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
          />
          {errors.format && (
            <p className="text-sm text-red-500">{errors.format}</p>
          )}
        </div>

        {/* Date */}
        <div className="space-y-2">
          <Label htmlFor="date">
            Game Date <span className="text-red-500">*</span>
          </Label>
          <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full h-12 justify-start text-left font-normal",
                  !formData.date && "text-muted-foreground",
                  errors.date && "border-red-500"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.date ? format(formData.date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white" align="start">
              <Calendar
                mode="single"
                selected={formData.date}
                onSelect={(date) => {
                  handleChange("date", date);
                  setDatePopoverOpen(false);
                }}
                initialFocus
                captionLayout="dropdown-buttons"
                fromYear={new Date().getFullYear() - 1}
                toYear={new Date().getFullYear() + 5}
              />
            </PopoverContent>
          </Popover>
          {errors.date && (
            <p className="text-sm text-red-500">{errors.date}</p>
          )}
        </div>

        {/* Icon */}
        <div className="space-y-2">
          <Label htmlFor="icon">Icon (Emoji)</Label>
          <div className="flex gap-2 items-center">
            <Input
              id="icon"
              value={formData.icon}
              onChange={(e) => handleChange("icon", e.target.value)}
              placeholder="e.g., ⚽"
              className="h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500 w-24 text-2xl text-center"
              maxLength={4}
            />
            <p className="text-sm text-muted-foreground">
              Auto-filled when selecting a sport. You can override it.
            </p>
          </div>
          {errors.icon && (
            <p className="text-sm text-red-500">{errors.icon}</p>
          )}
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="isActive">Status</Label>
          <Select
            value={formData.isActive.toString()}
            onValueChange={(value) => handleChange("isActive", value === "true")}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Brief description of the game..."
            rows={3}
            className={`border-gray-300 focus:border-orange-500 focus:ring-orange-500 ${
              errors.description ? "border-red-500 focus:ring-red-500" : ""
            }`}
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        {/* Rules */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="rules">Rules</Label>
          <Textarea
            id="rules"
            value={formData.rules}
            onChange={(e) => handleChange("rules", e.target.value)}
            placeholder="Game rules and regulations..."
            rows={4}
            className={`border-gray-300 focus:border-orange-500 focus:ring-orange-500 ${
              errors.rules ? "border-red-500 focus:ring-red-500" : ""
            }`}
          />
          {errors.rules && (
            <p className="text-sm text-red-500">{errors.rules}</p>
          )}
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
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? "Update" : "Create"} Game
        </Button>
      </div>
    </form>
  );
}