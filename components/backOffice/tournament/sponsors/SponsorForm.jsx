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
import { Loader2 } from "lucide-react";
import { ImageUploader } from "@/components/common/ImageUploader";
import { z } from "zod";
import { toast } from "sonner";
import { deleteImageKitFile } from "@/lib/imageKit";
import { createSponsorSchema } from "@/app/api/tournaments/sponsors/route";

const SPONSOR_CATEGORIES = [
  { value: "TITLE", label: "Title Sponsor" },
  { value: "GOLD", label: "Gold Sponsor" },
  { value: "SILVER", label: "Silver Sponsor" },
  { value: "BRONZE", label: "Bronze Sponsor" },
];

export function SponsorForm({
  onSubmit,
  onCancel,
  loading,
  initialData = null,
}) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    website: initialData?.website || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    logo: initialData?.logo || null,
    status: initialData?.status ?? true,
    category: initialData?.category || "",
  });

  const [errors, setErrors] = useState({});
  const [imagesToDelete, setImagesToDelete] = useState([]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleLogoUpload = (uploadedImages) => {
    if (uploadedImages && uploadedImages.length > 0) {
      const image = uploadedImages[0];
      if (formData.logo && formData.logo[0]?.id) {
        setImagesToDelete((prev) => [...prev, formData.logo[0].id]);
      }
      handleChange("logo", [{ url: image.url, id: image.fileId }]);
    }
  };

  const handleLogoRemove = (image) => {
    if (image.fileId) {
      setImagesToDelete((prev) => [...prev, image.fileId]);
    }
    handleChange("logo", null);
  };

  const handleWebsiteChange = (value) => {
    let processedValue = value.trim();
    if (processedValue && !processedValue.match(/^https?:\/\//i)) {
      processedValue = `http://${processedValue}`;
    }
    handleChange("website", processedValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      const validated = createSponsorSchema.parse(formData);

      await onSubmit(validated);

      if (imagesToDelete.length > 0) {
        await Promise.allSettled(
          imagesToDelete.map((fileId) => deleteImageKitFile(fileId)),
        ).catch((err) => console.error("Failed to delete old images:", err));
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = {};
        error.errors.forEach((err) => {
          const field = err.path[0];
          fieldErrors[field] = err.message;
        });
        setErrors(fieldErrors);
        toast.error(error.errors[0].message);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Sponsor Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className={`h-12 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 ${
              errors.name ? "border-red-500 focus:ring-red-500" : ""
            }`}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
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
              className={`h-12 border-gray-300 ${
                errors.category ? "border-red-500 focus:ring-red-500" : ""
              }`}
            >
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {SPONSOR_CATEGORIES.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-red-500">{errors.category}</p>
          )}
        </div>

        {/* Website */}
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              http://
            </span>
            <Input
              id="website"
              value={formData.website.replace(/^https?:\/\//i, "")}
              onChange={(e) => handleWebsiteChange(e.target.value)}
              className={`pl-16 h-12 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 ${
                errors.website ? "border-red-500 focus:ring-red-500" : ""
              }`}
            />
          </div>
          {errors.website && (
            <p className="text-sm text-red-500">{errors.website}</p>
          )}
        </div>

        {/* Contact Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Contact Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className={`h-12 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 ${
              errors.email ? "border-red-500 focus:ring-red-500" : ""
            }`}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        {/* Contact Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">Contact Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className={`h-12 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 ${
              errors.phone ? "border-red-500 focus:ring-red-500" : ""
            }`}
          />
          {errors.phone && (
            <p className="text-sm text-red-500">{errors.phone}</p>
          )}
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status.toString()}
            onValueChange={(value) => handleChange("status", value === "true")}
          >
            <SelectTrigger className="h-12 border-gray-300">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          rows={4}
          className={`border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 ${
            errors.description ? "border-red-500 focus:ring-red-500" : ""
          }`}
        />
        {errors.description && (
          <p className="text-xs text-red-500">{errors.description}</p>
        )}
      </div>

      {/* Logo Upload */}
      <div className="space-y-2">
        <Label>
          Sponsor Logo <span className="text-red-500">*</span>
        </Label>
        <ImageUploader
          onUploadComplete={handleLogoUpload}
          onImageRemove={handleLogoRemove}
          folder="/sponsors"
          multiple={false}
          existingImages={
            formData.logo
              ? [{ url: formData.logo[0].url, id: formData.logo[0].id }]
              : []
          }
        />
        {errors.logo && <p className="text-sm text-red-500">{errors.logo}</p>}
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
          disabled={loading || !formData.logo || !formData.category}
          className="bg-blue-600 text-white"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? "Update" : "Create"} Sponsor
        </Button>
      </div>
    </form>
  );
}
