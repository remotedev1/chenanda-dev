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
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Swal from "sweetalert2";

export default function CategoriesTable() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState({ name: "", slug: "" });

  // Fetch categories
  const fetchCategories = () => {
    setLoading(true);
    fetch("/api/categories")
      .then((res) => res.json())
      .then((res) => {
        setCategories(res);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Save (create or update)
  const handleSave = async () => {
    if (!form.name || !form.slug) {
      Swal.fire("Error", "Name and Slug are required", "error");
      return;
    }

    try {
      if (editingCategory) {
        // Update
        await fetch(`/api/categories/${editingCategory.id}`, {
          method: "PATCH",
          body: JSON.stringify(form),
          headers: { "Content-Type": "application/json" },
        });
      } else {
        // Create
        await fetch("/api/categories", {
          method: "POST",
          body: JSON.stringify(form),
          headers: { "Content-Type": "application/json" },
        });
      }
      setForm({ name: "", slug: "" });
      setEditingCategory(null);
      setOpenDialog(false);
      fetchCategories();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  // Edit category
  const handleEdit = (category) => {
    setEditingCategory(category);
    setForm({ name: category.name, slug: category.slug });
    setOpenDialog(true);
  };

  // Delete category
  // const handleDelete = async (id) => {
  //   const result = await Swal.fire({
  //     title: "Are you sure?",
  //     text: "This will delete the category permanently.",
  //     icon: "warning",
  //     showCancelButton: true,
  //     confirmButtonColor: "#d33",
  //     cancelButtonColor: "#aaa",
  //     confirmButtonText: "Yes, delete it!",
  //   });

  //   if (!result.isConfirmed) return;

  //   try {
  //     await fetch(`/api/categories/${id}`, { method: "DELETE" });
  //     fetchCategories();
  //   } catch (err) {
  //     console.error(err);
  //     Swal.fire("Error", "Failed to delete category", "error");
  //   }
  // };

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Categories</CardTitle>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingCategory(null);
                setForm({ name: "", slug: "" });
              }}
            >
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Edit Category" : "Add Category"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Name"
                name="name"
                value={form.name}
                onChange={handleChange}
              />
              <Input
                placeholder="Slug"
                name="slug"
                value={form.slug}
                onChange={handleChange}
              />
            </div>
            <DialogFooter>
              <Button onClick={handleSave}>
                {editingCategory ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-10 w-full" />
        ) : categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">No categories found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell>{cat.slug}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button size="sm" onClick={() => handleEdit(cat)}>
                      Edit
                    </Button>
                    {/* <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(cat.id)}
                    >
                      Delete
                    </Button> */}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
