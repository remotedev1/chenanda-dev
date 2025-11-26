// app/api/blog/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req) {
  const body = await req.json();

  const newPost = await db.blogPost.create({
    data: {
      title: body.title,
      slug: body.slug,
      description: body.description,
      content: body.content,
      author: body.author,
      tags: body.tags,
      images: body.images,
      status: body.status ?? "DRAFT",
      publishedAt: body.status === "PUBLISHED" ? new Date() : null,
    },
  });

  return NextResponse.json(newPost);
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const tag = searchParams.get("tag");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  const skip = (page - 1) * limit;

  const where = {
    AND: [
      tag ? { tags: { has: tag } } : {},
      search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { content: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }
        : {},
    ],
  };

  const [posts, total] = await Promise.all([
    db.blogPost.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    db.blogPost.count({ where }),
  ]);

  return NextResponse.json({
    data: posts,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}
