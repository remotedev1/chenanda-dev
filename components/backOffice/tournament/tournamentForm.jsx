"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useToastContext } from "@/components/providers/ToastProvider";

const sports = [
  { value: "FIELD_HOCKEY", label: "Field Hockey" },
  { value: "FOOTBALL", label: "Football" },
  { value: "CRICKET", label: "Cricket" },
  { value: "RELAY", label: "Relay" },
  { value: "BASKETBALL", label: "Basketball" },
  { value: "VOLLEYBALL", label: "Volleyball" },
  { value: "KABADDI", label: "Kabaddi" },
  { value: "ATHLETICS", label: "Athletics" },
  { value: "BADMINTON", label: "Badminton" },
  { value: "TABLE_TENNIS", label: "Table Tennis" },
  { value: "TENNIS", label: "Tennis" },
  { value: "SQUASH", label: "Squash" },
  { value: "CARROM", label: "Carrom" },
  { value: "CHESS", label: "Chess" },
  { value: "THROWBALL", label: "Throwball" },
  { value: "KHO_KHO", label: "Kho Kho" },
  { value: "SWIMMING", label: "Swimming" },
  { value: "WRESTLING", label: "Wrestling" },
  { value: "BOXING", label: "Boxing" },
  { value: "OTHER", label: "Other" },
];

const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  year: z.coerce.number().int().min(2000).max(2100),
  sports: z.array(z.string()).min(1, "Select at least one sport"),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date({ required_error: "End date is required" }),
  registrationDeadline: z.date().optional(),
  status: z.enum([
    "DRAFT",
    "REGISTRATION",
    "UPCOMING",
    "ONGOING",
    "COMPLETED",
    "CANCELLED",
  ]),
  description: z.string().optional(),
  images: z.string().optional(),
});

export function TournamentForm({ slug }) {
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [tournament, setTournament] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);
  const { success: successToast, error: errorToast } = useToastContext();
  const router = useRouter();

  const isEditMode = slug !== "new";

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      year: new Date().getFullYear(),
      sports: [],
      startDate: undefined,
      endDate: undefined,
      registrationDeadline: undefined,
      status: "DRAFT",
      description: "",
      images: "",
    },
  });

  // Fetch tournament data if editing
  useEffect(() => {
    if (isEditMode) {
      fetchTournament();
    }
  }, [slug]);

  const fetchTournament = async () => {
    try {
      setFetchLoading(true);
      const response = await fetch(`/api/tournaments/${slug}`);
      const data = await response.json();

      if (data.success) {
        const tournamentData = data.data;
        setTournament(tournamentData);
        setImageUrls(tournamentData.images || []);

        // Reset form with fetched data
        form.reset({
          name: tournamentData.name,
          year: tournamentData.year,
          sports: tournamentData.sports,
          startDate: new Date(tournamentData.startDate),
          endDate: new Date(tournamentData.endDate),
          registrationDeadline: tournamentData.registrationDeadline
            ? new Date(tournamentData.registrationDeadline)
            : undefined,
          status: tournamentData.status,
          description: tournamentData.description || "",
          images: "",
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      errorToast(error.message || "Failed to fetch tournament");
      router.push("/dashboard/game/tournaments-list");
    } finally {
      setFetchLoading(false);
    }
  };

  const addImageUrl = () => {
    const url = form.getValues("images");
    if (url && url.trim()) {
      try {
        new URL(url);
        setImageUrls([...imageUrls, url.trim()]);
        form.setValue("images", "");
      } catch {
        errorToast("Please enter a valid image URL");
      }
    }
  };

  const removeImageUrl = (index) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const onSubmit = async (values) => {
    try {
      setLoading(true);

      // Validate dates
      if (values.endDate <= values.startDate) {
        errorToast("End date must be after start date");
        return;
      }

      if (
        values.registrationDeadline &&
        values.registrationDeadline >= values.startDate
      ) {
        errorToast("Registration deadline must be before start date");
        return;
      }

      const payload = {
        name: values.name,
        year: values.year,
        sports: values.sports,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
        registrationDeadline: values.registrationDeadline?.toISOString(),
        status: values.status,
        description: values.description,
        images: imageUrls,
        sponsors: [],
        info: [],
      };

      const url = isEditMode ? `/api/tournaments/${slug}` : "/api/tournaments";
      const method = isEditMode ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        successToast(data.message);
        router.push("/tournaments");
        router.refresh();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      errorToast(error.message || "Failed to save tournament");
    } finally {
      setLoading(false);
    }
  };

  // Show loading skeleton while fetching in edit mode
  if (isEditMode && fetchLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-[250px]" />
          <Skeleton className="h-4 w-[350px]" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-32 w-full" />
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl rounded-2xl bg-blue-600">
      <CardHeader>
        <CardTitle>
          {isEditMode ? "Edit Tournament" : "Create New Tournament"}
        </CardTitle>
        <CardDescription>
          {isEditMode
            ? "Update tournament details"
            : "Fill in the details to create a new tournament"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tournament Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Summer Sports Festival 2024"
                        {...field}
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
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Sports Selection */}
            <FormField
              control={form.control}
              name="sports"
              render={() => (
                <FormItem>
                  <FormLabel>Sports</FormLabel>
                  <FormDescription>
                    Select all sports included in this tournament
                  </FormDescription>
                  <div className="grid grid-cols-2 gap-4 rounded-md border p-4 md:grid-cols-4">
                    {sports.map((sport) => (
                      <FormField
                        key={sport.value}
                        control={form.control}
                        name="sports"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={sport.value}
                              className="flex items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(sport.value)}
                                  className="bg-white text-black"
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([
                                          ...field.value,
                                          sport.value,
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== sport.value
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {sport.label}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dates */}
            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal bg-blue-600 ",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          className="bg-white text-black"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal bg-blue-600",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          className="bg-white text-black"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="registrationDeadline"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Registration Deadline</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal bg-blue-600",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="double"
                          className="bg-white text-black"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white text-black">
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="REGISTRATION">Registration</SelectItem>
                      <SelectItem value="UPCOMING">Upcoming</SelectItem>
                      <SelectItem value="ONGOING">Ongoing</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the tournament..."
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Images */}
            <div className="space-y-2">
              <FormLabel>Logo</FormLabel>
              <div className="flex gap-2">
                <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          placeholder="https://example.com/image.jpg"
                          {...field}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addImageUrl();
                            }
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="button" onClick={addImageUrl} variant="secondary">
                  Add
                </Button>
              </div>
              {imageUrls.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {imageUrls.map((url, index) => (
                    <Badge key={index} variant="secondary" className="pr-1">
                      <span className="max-w-[200px] truncate">{url}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="ml-1 h-4 w-4"
                        onClick={() => removeImageUrl(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="ghost"
                className="bg-red-500 hover:bg-red-700"
                onClick={() => router.push("/tournaments")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? "Update Tournament" : "Create Tournament"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
