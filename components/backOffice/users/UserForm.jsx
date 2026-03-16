"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Upload, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

// ─── Schema ────────────────────────────────────────────────────────────────────

const baseSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  email: z.string().email("Invalid email address"),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .or(z.literal(""))   // allow empty string (field is optional)
    .optional(),
  alternateNumber: z.string().optional(),
  // role enum now matches the three <SelectItem> values
  role: z.enum(["USER", "SCORER", "ADMIN"], {
    required_error: "Please select a role",
  }),
  isActive: z.boolean().default(true),
  isBlocked: z.boolean().default(false),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  images: z.array(z.string()).optional(),
});

// Password is REQUIRED when creating, optional when editing
const createSchema = baseSchema.extend({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
});

const editSchema = baseSchema.extend({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .or(z.literal(""))   // allow blank → keep current password
    .optional(),
});



// ─── Component ─────────────────────────────────────────────────────────────────

export const UserForm = ({
  onSubmit,
  onCancel,
  loading = false,
  initialData = null,
}) => {
  const isEdit = !!initialData;

  const [imagePreview, setImagePreview] = useState(
    (initialData?.images?.[0]) ?? null,
  );
  const [uploadingImage, setUploadingImage] = useState(false);

  const form = useForm({
    resolver: zodResolver(isEdit ? editSchema : createSchema),
    defaultValues: {
      firstName: initialData?.firstName ?? "",
      lastName: initialData?.lastName ?? "",
      email: initialData?.email ?? "",
      phoneNumber: initialData?.phoneNumber ?? "",
      alternateNumber: initialData?.alternateNumber ?? "",
      password: "",
      role: initialData?.role ?? "USER",
      isActive: initialData?.isActive ?? true,
      isBlocked: initialData?.isBlocked ?? false,
      address: {
        street: initialData?.address?.street ?? "",
        city: initialData?.address?.city ?? "",
        state: initialData?.address?.state ?? "",
        zipCode: initialData?.address?.zipCode ?? "",
        country: initialData?.address?.country ?? "",
      },
      images: initialData?.images ?? [],
    },
  });

  // ── Image helpers ────────────────────────────────────────────────────────────

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result ;
        setImagePreview(result);
        form.setValue("images", [result]);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    form.setValue("images", []);
  };

  // ── Submit ───────────────────────────────────────────────────────────────────

  const handleSubmit = (data) => {
    // Strip blank password on edit so the backend keeps the existing one
    if (isEdit && !data.password) {
      const { password, ...rest } = data ;
      return onSubmit(rest);
    }
    onSubmit(data);
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">

        {/* ── Personal Information ───────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Profile image */}
            <div className="flex items-center gap-4">
              <div className="relative">
                {imagePreview ? (
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
                    <Image
                      fill
                      src={imagePreview}
                      alt="Profile"
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <label className="w-24 h-24 rounded-full bg-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors">
                    <Upload className="h-8 w-8 text-gray-400" />
                    <span className="text-xs text-gray-400 mt-1">Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />
                  </label>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {uploadingImage ? "Uploading…" : "Profile picture (optional)"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />   {/* ← shows Zod error */}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Contact Information ────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address *</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="alternateNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alternate Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Account Security ───────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account Security</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password {!isEdit && "*"}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={
                        isEdit
                          ? "Leave blank to keep current password"
                          : "Min. 8 characters"
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {isEdit
                      ? "Leave blank to keep the current password"
                      : "Minimum 8 characters required"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* ── Role & Permissions ─────────────────────────────────────────────── */}
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-orange-600">🔒</span>
              Role &amp; Permissions
              <span className="text-xs font-normal text-orange-600">
                (Super Admin Only)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 w-fit">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Role</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-slate-100">
                      <SelectItem value="USER">User</SelectItem>
                      <SelectItem value="SCORER">Scorer</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Defines the user&apos;s permissions and access level
                  </FormDescription>
                  <FormMessage />   {/* ← shows role error */}
                </FormItem>
              )}
            />

            <Separator />

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Account</FormLabel>
                      <FormDescription>
                        User can log in and access the system
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isBlocked"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base text-red-600">
                        Block Account
                      </FormLabel>
                      <FormDescription>
                        Prevent user from accessing the system entirely
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-red-600 data-[state=unchecked]:bg-blue-600"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Actions ────────────────────────────────────────────────────────── */}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {loading ? "Saving…" : isEdit ? "Update User" : "Create User"}
          </Button>
        </div>
      </form>
    </Form>
  );
};