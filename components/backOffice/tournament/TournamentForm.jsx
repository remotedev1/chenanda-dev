"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Loader2, Save } from "lucide-react";
import {
  createTournamentSchema,
  updateTournamentSchema,
  TournamentStatus,
} from "@/schemas/tournament.schema";

export function TournamentForm({
  tournament = null,
  onSubmit,
  onCancel,
  loading = false,
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const isEditing = !!tournament;

  const form = useForm({
    resolver: zodResolver(
      isEditing ? updateTournamentSchema : createTournamentSchema,
    ),
    defaultValues: {
      name: tournament?.name || "",
      year: tournament?.year || new Date().getFullYear(),
      startDate: tournament?.startDate || "",
      endDate: tournament?.endDate || "",
      status: tournament?.status || "DRAFT",
      description: tournament?.description || "",
      sponsors: tournament?.sponsors || [],
      info: tournament?.info || [],
      images: tournament?.images || [],
      games: tournament?.games || [],
    },
  });

  const handleSubmit = (data) => {
    setShowConfirm(true);
  };

  const confirmSubmit = async () => {
    const data = form.getValues();
    await onSubmit(data);
    setShowConfirm(false);
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Basic Information */}

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tournament Name *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className={`h-12 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 ${
                      form.formState.errors.name ? "border-red-500" : ""
                    }`}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    className={`h-12 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 ${
                      form.formState.errors.year ? "border-red-500" : ""
                    }`}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    className={`h-12 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 ${
                      form.formState.errors.description ? "border-red-500" : ""
                    }`}
                    maxLength={500}
                    {...field}
                  />
                </FormControl>
                <FormDescription>Maximum 500 characters</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-[180px] text-white bg-gray-700 [&>span]:text-white cursor-pointer">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="min-w-[180px] bg-slate-50 dark:text-white dark:bg-slate-800">
                    {Object.entries(TournamentStatus).map(([key, value]) => (
                      <SelectItem key={value} value={value}>
                        {key.charAt(0) +
                          key.slice(1).toLowerCase().replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Dates */}

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date *</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={
                        field.value
                          ? new Date(field.value).toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) => {
                        const date = e.target.value
                          ? new Date(e.target.value).toISOString()
                          : "";
                        field.onChange(date);
                      }}
                      className={`h-12 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 block w-full bg-black/5 [color-scheme:light] ${
                        form.formState.errors.startDate ? "border-red-500" : ""
                      }`}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date *</FormLabel>
                  <FormControl>
                    <Input
                      className={`h-12 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 block w-full bg-black/5 [color-scheme:light] ${
                        form.formState.errors.endDate ? "border-red-500" : ""
                      }`}
                      type="date"
                      value={
                        field.value
                          ? new Date(field.value).toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) => {
                        const date = e.target.value
                          ? new Date(e.target.value).toISOString()
                          : "";
                        field.onChange(date);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              {isEditing ? "Update Tournament" : "Create Tournament"}
            </Button>
          </div>
        </form>
      </Form>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="bg-white dark:bg-slate-800 dark:text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isEditing ? "Update Tournament?" : "Create Tournament?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isEditing
                ? "Are you sure you want to update this tournament? This will modify the existing tournament details."
                : "Are you sure you want to create this tournament? You can edit the details later."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSubmit}
              disabled={loading}
              className="bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
