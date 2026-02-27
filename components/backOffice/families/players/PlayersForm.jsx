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
import { Loader2, Plus, X, Calendar as CalendarIcon, Users } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useFamilies } from "@/hooks/useFamily";
import ReactSelect from "react-select";

// Validation schema
const createPlayerSchema = z.object({
  playerName: z
    .string()
    .min(2, "Player name must be at least 2 characters")
    .max(100, "Player name is too long"),
  dateOfBirth: z.date().optional().nullable(),
  primarySport: z
    .enum([
      "FOOTBALL",
      "BASKETBALL",
      "VOLLEYBALL",
      "CRICKET",
      "TENNIS",
      "BADMINTON",
      "ATHLETICS",
    ])
    .optional()
    .nullable(),
  jerseyNumber: z.number().min(0).max(999).optional().nullable(),
  biography: z.string().max(2000, "Biography is too long").optional(),
  info: z.array(z.record(z.any())).optional().default([]),
  familyId: z.string().min(1, "Family is required"),
  isActive: z.boolean().default(true),
});

/* ---- FamilyCombobox ---- */
function FamilyCombobox({ value, onChange, families, loading, error }) {
  const options = families.map((family) => ({
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
      "&:hover": {
        borderColor: state.isFocused ? "#f97316" : "#d1d5db",
      },
      cursor: "pointer",
    }),
    valueContainer: (provided) => ({
      ...provided,
      height: "48px",
      padding: "0 8px",
    }),
    input: (provided) => ({
      ...provided,
      margin: "0px",
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      height: "48px",
    }),
    clearIndicator: (provided) => ({
      ...provided,
      cursor: "pointer",
      padding: "4px",
      "&:hover": {
        color: "#6b7280",
      },
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
      "&:active": {
        backgroundColor: "#fed7aa",
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#9ca3af",
    }),
  };

  const formatOptionLabel = ({ label }) => (
    <div className="flex items-center gap-2">
      <span className="h-6 w-6 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
        {label.charAt(0)}
      </span>
      <span className="truncate">{label}</span>
    </div>
  );

  const CustomPlaceholder = ({ children }) => (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Users className="h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  );

  return (
    <ReactSelect
      value={selectedOption}
      onChange={(option) => onChange(option ? option.value : null)}
      options={options}
      isLoading={loading}
      isDisabled={loading}
      isClearable={false}
      isSearchable
      placeholder={
        <CustomPlaceholder>
          {loading ? "Loading families..." : "Search and select a family"}
        </CustomPlaceholder>
      }
      noOptionsMessage={() => "No family found"}
      styles={customStyles}
      formatOptionLabel={formatOptionLabel}
    />
  );
}

export function PlayerForm({
  onSubmit,
  onCancel,
  loading,
  initialData = null,
}) {
  const [formData, setFormData] = useState({
    playerName: initialData?.playerName || "",
    dateOfBirth: initialData?.dateOfBirth
      ? new Date(initialData.dateOfBirth)
      : null,
    primarySport: initialData?.primarySport || null,
    jerseyNumber: initialData?.jerseyNumber || null,
    biography: initialData?.biography || "",
    info: initialData?.info || [],
    familyId: initialData?.familyId || "",
    isActive: initialData?.isActive ?? true,
  });

  const [errors, setErrors] = useState({});
  const [infoInput, setInfoInput] = useState({ key: "", value: "" });

  const { families, loading: loadingFamilies } = useFamilies({ limit: 1000 });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleAddInfo = () => {
    if (!infoInput.key.trim() || !infoInput.value.trim()) {
      toast.error("Both key and value are required");
      return;
    }
    const newInfo = { [infoInput.key]: infoInput.value };
    handleChange("info", [...formData.info, newInfo]);
    setInfoInput({ key: "", value: "" });
  };

  const handleRemoveInfo = (index) => {
    const updatedInfo = formData.info.filter((_, idx) => idx !== index);
    handleChange("info", updatedInfo);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      const dataToValidate = {
        ...formData,
        jerseyNumber: formData.jerseyNumber
          ? Number(formData.jerseyNumber)
          : null,
      };

      const validated = createPlayerSchema.parse(dataToValidate);
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
        {/* Player Name */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="playerName">
            Player Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="playerName"
            value={formData.playerName}
            onChange={(e) => handleChange("playerName", e.target.value)}
            placeholder="Enter player name"
            className={`h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500 ${
              errors.playerName ? "border-red-500 focus:ring-red-500" : ""
            }`}
          />
          {errors.playerName && (
            <p className="text-sm text-red-500">{errors.playerName}</p>
          )}
        </div>

        {/* Family Selection — with ReactSelect */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="familyId">
            Family <span className="text-red-500">*</span>
          </Label>
          <FamilyCombobox
            value={formData.familyId}
            onChange={(id) => handleChange("familyId", id)}
            families={families}
            loading={loadingFamilies}
            error={errors.familyId}
          />
          {errors.familyId && (
            <p className="text-sm text-red-500">{errors.familyId}</p>
          )}
        </div>

        {/* Date of Birth */}
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full h-12 justify-start text-left font-normal",
                  !formData.dateOfBirth && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.dateOfBirth ? (
                  format(formData.dateOfBirth, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white" align="start">
              <Calendar
                mode="single"
                selected={formData.dateOfBirth}
                onSelect={(date) => handleChange("dateOfBirth", date)}
                initialFocus
                disabled={(date) =>
                  date > new Date() || date < new Date("1900-01-01")
                }
                captionLayout="dropdown-buttons"
                fromYear={1950}
                toYear={new Date().getFullYear()}
              />
            </PopoverContent>
          </Popover>
          {errors.dateOfBirth && (
            <p className="text-sm text-red-500">{errors.dateOfBirth}</p>
          )}
        </div>

        {/* Primary Sport */}
        <div className="space-y-2">
          <Label htmlFor="primarySport">Primary Sport</Label>
          <Select
            value={formData.primarySport || "none"}
            onValueChange={(value) =>
              handleChange("primarySport", value === "none" ? null : value)
            }
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select sport" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="FOOTBALL">Football</SelectItem>
              <SelectItem value="BASKETBALL">Basketball</SelectItem>
              <SelectItem value="VOLLEYBALL">Volleyball</SelectItem>
              <SelectItem value="CRICKET">Cricket</SelectItem>
              <SelectItem value="TENNIS">Tennis</SelectItem>
              <SelectItem value="BADMINTON">Badminton</SelectItem>
              <SelectItem value="ATHLETICS">Athletics</SelectItem>
            </SelectContent>
          </Select>
          {errors.primarySport && (
            <p className="text-sm text-red-500">{errors.primarySport}</p>
          )}
        </div>

        {/* Jersey Number */}
        <div className="space-y-2">
          <Label htmlFor="jerseyNumber">Jersey Number</Label>
          <Input
            id="jerseyNumber"
            type="number"
            min="0"
            max="999"
            value={formData.jerseyNumber || ""}
            onChange={(e) =>
              handleChange(
                "jerseyNumber",
                e.target.value ? Number(e.target.value) : null
              )
            }
            placeholder="e.g., 10"
            className={`h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500 ${
              errors.jerseyNumber ? "border-red-500 focus:ring-red-500" : ""
            }`}
          />
          {errors.jerseyNumber && (
            <p className="text-sm text-red-500">{errors.jerseyNumber}</p>
          )}
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="isActive">Status</Label>
          <Select
            value={formData.isActive.toString()}
            onValueChange={(value) =>
              handleChange("isActive", value === "true")
            }
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

        {/* Biography */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="biography">Biography</Label>
          <Textarea
            id="biography"
            value={formData.biography}
            onChange={(e) => handleChange("biography", e.target.value)}
            placeholder="Player's background, achievements, and other information..."
            rows={4}
            className={`border-gray-300 focus:border-orange-500 focus:ring-orange-500 ${
              errors.biography ? "border-red-500 focus:ring-red-500" : ""
            }`}
          />
          {errors.biography && (
            <p className="text-sm text-red-500">{errors.biography}</p>
          )}
        </div>

        {/* Additional Info */}
        <div className="space-y-2 md:col-span-2">
          <Label>Additional Information</Label>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={infoInput.key}
                onChange={(e) =>
                  setInfoInput((prev) => ({ ...prev, key: e.target.value }))
                }
                placeholder="Key (e.g., height)"
                className="flex-1"
              />
              <Input
                value={infoInput.value}
                onChange={(e) =>
                  setInfoInput((prev) => ({ ...prev, value: e.target.value }))
                }
                placeholder="Value (e.g., 6'2)"
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddInfo();
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleAddInfo}
                variant="outline"
                size="icon"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {formData.info.length > 0 && (
              <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                {formData.info.map((item, idx) => {
                  const [key, value] = Object.entries(item)[0];
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 bg-white rounded border"
                    >
                      <div className="flex-1">
                        <span className="font-medium text-sm">{key}:</span>{" "}
                        <span className="text-sm text-gray-600">{value}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveInfo(idx)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
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
          {initialData ? "Update" : "Create"} Player
        </Button>
      </div>
    </form>
  );
}