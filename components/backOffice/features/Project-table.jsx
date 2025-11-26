"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageUpload } from "./Image-upload";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import Swal from "sweetalert2";
import { Loader } from "@/components/common/Loader";

const projectSchema = z.object({
  projectName: z.string().min(1, "Project name is required"),
  projectType: z.enum(
    [
      "RESIDENTIAL",
      "COMMERCIAL",
      "INDUSTRIAL",
      "INSTITUTIONAL",
      "INFRASTRUCTURE",
      "MIXED_USE",
    ],
    { required_error: "Project type is required" }
  ),
  location: z.string().min(1, "Location is required"),
  status: z.enum(["ACTIVE", "NEAR_COMPLETION", "COMPLETED"], {
    required_error: "Status is required",
  }),
  overview: z.string().min(1, "Overview is required"),
  objectives: z.array(z.string()),
  keyFeatures: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
    })
  ),
  technologiesUsed: z.array(z.string().min(1)),
  imageGallery: z.array(
    z.union([
      // Case 1: Uploaded file
      z.instanceof(File),

      // Case 2: Saved image object
      z.object({
        url: z.string().url(),
        fileId: z.string(),
      }),
    ])
  ),
  deletedFileIds: z.array(z.string()).optional(),
  youtubeLinks: z.array(z.string().min(1)),
  instagramLinks: z.array(z.string().min(1)),
});

// Chip input component
const ChipInput = ({ label, name, addChip, removeChip, values }) => {
  const [inputValue, setInputValue] = useState("");
  return (
    <div className="space-y-2">
      <FormLabel>{label}</FormLabel>
      <div className="flex flex-wrap gap-2">
        {values.map((val, idx) => (
          <span
            key={idx}
            className="px-2 py-1 bg-muted rounded-full flex items-center gap-1 text-sm"
          >
            {val}
            <button
              type="button"
              className="text-destructive hover:text-destructive/80"
              onClick={() => removeChip(name, idx)}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <Input
        placeholder={`Add ${label.toLowerCase()}, press enter to add more`}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            addChip(name, inputValue);
            setInputValue("");
          }
        }}
      />
    </div>
  );
};

// Auto-expand Textarea
const AutoTextarea = ({ field, ...props }) => {
  const [height, setHeight] = useState("auto");
  const handleChange = (e) => {
    setHeight("auto");
    setHeight(`${e.target.scrollHeight}px`);
    field.onChange(e);
  };
  return (
    <Textarea
      {...field}
      {...props}
      style={{ height }}
      onChange={handleChange}
    />
  );
};

export default function ProjectsTable() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const form = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      projectName: "",
      projectType: "RESIDENTIAL",
      location: "",
      status: "ACTIVE",
      overview: "",
      objectives: [],
      keyFeatures: [],
      technologiesUsed: [],
      imageGallery: [],
      deletedFileIds: [],
      youtubeLinks: [],
      instagramLinks: [],
    },
  });

  const keyFeaturesField = useFieldArray({
    control: form.control,
    name: "keyFeatures",
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    const res = await fetch("/api/projects");
    setProjects(await res.json());
    setLoading(false);
  };

const onSubmit = async (values) => {
  try {
    const formData = new FormData();

    Object.entries(values).forEach(([key, val]) => {
      if (key === "image") {
        // Support uploading a single file
        if (val instanceof File) {
          formData.append("image", val);
        }
      } else {
        formData.append(key, typeof val === "string" ? val : JSON.stringify(val));
      }
    });

    const url = editingId ? `/api/news/${editingId}` : "/api/news";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, { method, body: formData });

    if (!res.ok) throw new Error("Failed to save news");

    setEditingId(null);

    // Reset form to default values
    form.reset({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      image: "",
      tags: [],
      isPublished: false,
      categoryId: "",
      authorId: "",
    });

    fetchNews();

    Swal.fire(
      editingId ? "Updated!" : "Created!",
      `News ${editingId ? "updated" : "created"} successfully.`,
      "success"
    );
  } catch (err) {
    Swal.fire("Error", err.message, "error");
  }
};


  const handleArchive = async (id) => {
    Swal.fire({
      title: "Archive this project?",
      icon: "warning",
      showCancelButton: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        await fetch(`/api/projects/${id}/archive`, { method: "PATCH" });
        fetchProjects();
      }
    });
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Delete this project?",
      icon: "error",
      showCancelButton: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        await fetch(`/api/projects/${id}`, { method: "DELETE" });
        fetchProjects();
      }
    });
  };

  const addChip = (field, value) => {
    if (value.trim()) {
      form.setValue(field, [...form.getValues(field), value.trim()]);
    }
  };

  const removeChip = (field, index) => {
    const arr = [...form.getValues(field)];
    arr.splice(index, 1);
    form.setValue(field, arr);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit Project" : "Create Project"}</CardTitle>
        </CardHeader>
        <CardContent>
          <FormProvider {...form}>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid gap-4 sm:grid-cols-2"
              >
                {/* Project Name */}
                <FormField
                  control={form.control}
                  name="projectName"
                  render={({ field }) => (
                    <FormItem className="col-span-2 sm:col-span-1">
                      <FormLabel>Project Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Project Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Project Type */}
                <FormField
                  control={form.control}
                  name="projectType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Type</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            "RESIDENTIAL",
                            "COMMERCIAL",
                            "INDUSTRIAL",
                            "INSTITUTIONAL",
                            "INFRASTRUCTURE",
                            "MIXED_USE",
                          ].map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Location */}
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Location" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Status */}
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {["ACTIVE", "NEAR_COMPLETION", "COMPLETED"].map(
                            (s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Overview */}
                <FormField
                  control={form.control}
                  name="overview"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Overview</FormLabel>
                      <FormControl>
                        <AutoTextarea
                          placeholder="Write a brief overview..."
                          field={field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Chips */}
                <div className="col-span-2 space-y-4">
                  <ChipInput
                    label="objectives"
                    name="objectives"
                    addChip={addChip}
                    removeChip={removeChip}
                    values={form.watch("objectives")}
                  />
                  <ChipInput
                    label="Technologies Used"
                    name="technologiesUsed"
                    addChip={addChip}
                    removeChip={removeChip}
                    values={form.watch("technologiesUsed")}
                  />
                  <ChipInput
                    label="YouTube Links"
                    name="youtubeLinks"
                    addChip={addChip}
                    removeChip={removeChip}
                    values={form.watch("youtubeLinks")}
                  />
                  <ChipInput
                    label="Instagram Links"
                    name="instagramLinks"
                    addChip={addChip}
                    removeChip={removeChip}
                    values={form.watch("instagramLinks")}
                  />
                </div>
                {/* Key Features */}
                <div className="col-span-2 space-y-4">
                  <FormLabel>Key Features</FormLabel>
                  {keyFeaturesField.fields.map((item, index) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-2 gap-2 items-start"
                    >
                      <Input
                        placeholder="Feature Title"
                        {...form.register(`keyFeatures.${index}.title`)}
                      />
                      <Input
                        placeholder="Feature Description"
                        {...form.register(`keyFeatures.${index}.description`)}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => keyFeaturesField.remove(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    onClick={() =>
                      keyFeaturesField.append({ title: "", description: "" })
                    }
                  >
                    Add Feature
                  </Button>
                </div>
                {/* Images */}
                <div className="col-span-2">
                  <ImageUpload name="imageGallery" />
                </div>
                {/* Submit */}
                <div className="col-span-2 flex gap-2">
                  {form.formState.isSubmitting ? (
                    <Loader />
                  ) : (
                    <Button type="submit" className="flex-1">
                      {editingId ? "Update" : "Create"}
                    </Button>
                  )}
                  {editingId && (
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        form.reset();
                        setEditingId(null);
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </FormProvider>
        </CardContent>
      </Card>
      {/* Projects List */}
      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            [...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-full mb-2" />
            ))
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.projectName}</TableCell>
                    <TableCell>{p.projectType}</TableCell>
                    <TableCell>{p.location}</TableCell>
                    <TableCell>{p.status}</TableCell>
                    <TableCell className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingId(p.id);
                          form.reset(p);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleArchive(p.id)}
                      >
                        Archive
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(p.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
