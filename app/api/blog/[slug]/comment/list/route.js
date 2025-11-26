import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(_, { params }) {
  const post = await db.blogPost.findUnique({
    where: { slug: params.slug },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const comments = await db.comment.findMany({
    where: { postId: post.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(comments);
}
