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
import { Skeleton } from "@/components/ui/skeleton";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
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
import Swal from "sweetalert2";
import { Loader } from "@/components/common/Loader";
import { NewsSchema } from "@/schemas"; // your schema
import { ImageUpload } from "./Image-upload";

export default function EventTable() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [categories, setCategories] = useState([]);

  // Default values for the form, used for creation and reset
  const defaultFormValues = {
    title: "",
    content: "",
    images: [],
    tags: [],
    categoryId: "",
    deletedFileIds: [],
  };

  const form = useForm({
    resolver: zodResolver(NewsSchema),
    defaultValues: defaultFormValues,
  });

  useEffect(() => {
    fetchNews();
    fetchCategories();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    const res = await fetch("/api/news");
    const data = await res.json();
    setNews(data);
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Fetch categories error:", error);
      Swal.fire("Error", "Could not load categories.", "error");
    }
  };

  const onSubmit = async (values) => {
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, val]) => {
        if (key === "images") {
          val.forEach((file) => formData.append("images", file));
        } else {
          formData.append(
            key,
            typeof val === "string" ? val : JSON.stringify(val)
          );
        }
      });

      formData.append(
        "deletedFileIds",
        JSON.stringify(values.deletedFileIds || [])
      );

      const url = editingId ? `/api/news/${editingId}` : "/api/news";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, { method, body: formData });
      if (!res.ok) throw new Error("Failed to save news");

      setEditingId(null);
      form.reset(defaultFormValues);
      // --- NEW: Hide form after successful submission ---
      setIsFormVisible(false);
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

  // const handleDelete = async (id) => {
  //   Swal.fire({
  //     title: "Delete this news?",
  //     icon: "warning",
  //     showCancelButton: true,
  //   }).then(async (result) => {
  //     if (result.isConfirmed) {
  //       await fetch(`/api/news/${id}`, { method: "DELETE" });
  //       fetchNews();
  //     }
  //   });
  // };

  const handlePublishToggle = async (id, currentStatus) => {
    const nextStatus = !currentStatus;
    Swal.fire({
      title: `Are you sure you want to ${
        nextStatus ? "publish" : "unpublish"
      } this news?`,
      icon: "warning",
      showCancelButton: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        await fetch(`/api/news/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ isPublished: nextStatus }),
          headers: { "Content-Type": "application/json" },
        });
        fetchNews();
      }
    });
  };

  const handleEditClick = (item) => {
    setEditingId(item.id);
    // Ensure tags are an array, providing a fallback
    form.reset({ ...item, tags: Array.isArray(item.tags) ? item.tags : [] });
    setIsFormVisible(true);
  };

  const handleCreateClick = () => {
    setEditingId(null);
    form.reset(defaultFormValues);
    setIsFormVisible(true);
  };

  const handleCancelClick = () => {
    setEditingId(null);
    form.reset(defaultFormValues);
    setIsFormVisible(false);
  };

  return (
    <div className="space-y-6">
      {/* --- MODIFIED: Form is now conditionally rendered --- */}
      {isFormVisible && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit News" : "Create News"}</CardTitle>
          </CardHeader>
          <CardContent>
            <FormProvider {...form}>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="grid gap-4 sm:grid-cols-2"
                >
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Tags (comma separated)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="tag1, tag2"
                            // Ensure field.value is always an array before calling join
                            value={
                              Array.isArray(field.value)
                                ? field.value.join(", ")
                                : ""
                            }
                            onChange={(e) =>
                              field.onChange(
                                e.target.value.split(",").map((t) => t.trim())
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="col-span-2">
                    <FormLabel>Upload Image</FormLabel>
                    <ImageUpload name="images" />
                  </div>

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Content"
                            {...field}
                            className="h-60"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="col-span-2 flex gap-2">
                    {form.formState.isSubmitting ? (
                      <Loader />
                    ) : (
                      <Button type="submit" className="flex-1">
                        {editingId ? "Update" : "Create"}
                      </Button>
                    )}
                    {/* --- MODIFIED: Cancel button now has a dedicated handler --- */}
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={handleCancelClick}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </FormProvider>
          </CardContent>
        </Card>
      )}

      {/* News List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All News</CardTitle>
          {/* --- NEW: Button to show the create form --- */}
          <Button onClick={handleCreateClick}>Create News</Button>
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
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* {!news.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.title}</TableCell>
                    <TableCell>
                      {item.category?.name || item.categoryId}
                    </TableCell>
                    <TableCell>{item.author?.name || item.authorId}</TableCell>
                    <TableCell>
                      {item.isPublished ? "Published" : "Draft"}
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button size="sm" onClick={() => handleEditClick(item)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        onClick={() =>
                          handlePublishToggle(item.id, item.isPublished)
                        }
                      >
                        {item.isPublished ? "Unpublish" : "Publish"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </Button> 
                    </TableCell>
                  </TableRow>
                ))} */}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
