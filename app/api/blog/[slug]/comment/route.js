import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  const body = await req.json();
  const { author, email, content } = body;

  if (!author || !email || !content) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const post = await db.blogPost.findUnique({
    where: { slug: params.slug },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const comment = await db.comment.create({
    data: {
      postId: post.id,
      author,
      email,
      content,
    },
  });

  return NextResponse.json(comment);
}
