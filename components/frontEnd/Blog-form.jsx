"use client";

import { useForm, FormProvider, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Swal from "sweetalert2";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { ImageUpload } from "../backOffice/features/Image-upload";
import { useEffect, useState } from "react";

// ----------------------
// Zod Schema
// ----------------------
const blogSchema = z.object({
  title: z.string().min(3, "Title is required"),
  slug: z.string().min(3, "Slug is required"),
  description: z.string().optional(),
  author: z.string().min(2, "Author required"),
  category: z.string().nonempty("Select a category"),
  tags: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  sections: z
    .array(
      z.object({
        content: z.string().min(1, "Content required"),
        images: z.array(z.any()).optional(),
      })
    )
    .min(1, "At least one section is required"),
});

// ----------------------
// Section Editor Component
// ----------------------
function SectionEditor({ index, content, setValue }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => {
      setValue(`sections.${index}.content`, editor.getHTML(), {
        shouldValidate: true,
      });
    },
    immediatelyRender: false,
  });

  if (!mounted) return null;

  return (
    <div className="border p-4 rounded-lg space-y-4 bg-gray-50">
      <Label>Content</Label>
      <div className="border rounded p-2 min-h-[120px]">
        {editor && <EditorContent editor={editor} />}
      </div>

      <Label>Images for this section</Label>
      <ImageUpload name={`sections.${index}.images`} multiple />
    </div>
  );
}

// ----------------------
// Main Blog Form
// ----------------------
export default function BlogCreateForm() {
  const methods = useForm({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      author: "",
      category: "",
      tags: "",
      status: "DRAFT",
      sections: [{ content: "", images: [] }],
    },
  });

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = methods;

  const sections = watch("sections");

  const addSection = () => {
    setValue("sections", [...sections, { content: "", images: [] }]);
  };

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      tags: data.tags
        ? data.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
    };

    try {
      const res = await fetch("/api/blog", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create blog");
      Swal.fire("Success", "Blog post created!", "success");
      methods.reset();
    } catch (err) {
      Swal.fire("Error", err.message || "Something went wrong", "error");
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 bg-white text-black p-6 rounded-lg shadow max-w-3xl mx-auto"
      >
        {/* Basic Fields */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <div>
            <Label>Title</Label>
            <Input {...methods.register("title")} required />
          </div>
          <div>
            <Label>Slug</Label>
            <Input {...methods.register("slug")} required />
          </div>
          <div>
            <Label>Author</Label>
            <Input {...methods.register("author")} required />
          </div>
          <div>
            <Label>Category</Label>
            <Controller
              name="category"
              control={methods.control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TECH">Tech</SelectItem>
                    <SelectItem value="NEWS">News</SelectItem>
                    <SelectItem value="SPORTS">Sports</SelectItem>
                    <SelectItem value="LIFESTYLE">Lifestyle</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div>
            <Label>Tags (comma-separated)</Label>
            <Input {...methods.register("tags")} />
          </div>
          <div>
            <Label>Status</Label>
            <Controller
              name="status"
              control={methods.control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        {/* Sections with Rich Editor + ImageUpload */}
        <div className="space-y-6">
          <Label>Sections</Label>
          {sections.map((section, i) => (
            <SectionEditor
              key={i}
              index={i}
              content={section.content}
              setValue={setValue}
            />
          ))}
          <Button type="button" onClick={addSection} variant="secondary">
            + Add Section
          </Button>
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? "Posting..." : "Post Blog"}
        </Button>
      </form>
    </FormProvider>
  );
}
