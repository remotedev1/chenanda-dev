"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function BlogModerationCard({ slug }) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`/api/blog/${slug}`);
        setPost(res.data);
      } catch (err) {
        Swal.fire("Error", "Failed to load post.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  const confirmAndUpdate = async (status) => {
    const action = status === "PUBLISHED" ? "approve" : "reject";

    const result = await Swal.fire({
      title: `Are you sure you want to ${action} this post?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: status === "PUBLISHED" ? "#3085d6" : "#d33",
      cancelButtonColor: "#aaa",
      confirmButtonText: `Yes, ${action} it!`,
    });

    if (!result.isConfirmed || !post) return;

    try {
      setUpdating(true);
      await axios.patch(`/api/blog/${slug}`, { status });
      setPost((prev) => (prev ? { ...prev, status } : prev));
      Swal.fire("Success", `Post ${action}d successfully!`, "success");
    } catch {
      Swal.fire("Error", `Failed to ${action} the post.`, "error");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!post) return <div>Post not found.</div>;

  return (
    <div className="border p-4 rounded-xl space-y-4 bg-white shadow">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{post.title}</h1>
        <Badge
          variant={
            post.status === "PUBLISHED"
              ? "success"
              : post.status === "ARCHIVED"
              ? "destructive"
              : "secondary"
          }
        >
          {post.status}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        By {post.author} • {new Date(post.createdAt).toLocaleString()}
      </p>
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
      <div className="flex gap-2 pt-4">
        <Button
          disabled={updating || post.status === "PUBLISHED"}
          onClick={() => confirmAndUpdate("PUBLISHED")}
        >
          Approve
        </Button>
        <Button
          variant="destructive"
          disabled={updating || post.status === "ARCHIVED"}
          onClick={() => confirmAndUpdate("ARCHIVED")}
        >
          Reject
        </Button>
      </div>
    </div>
  );
}
