import { auth } from "@/auth";
import { db } from "@/lib/db";
import { imageKit } from "@/lib/imageKit";
import { NextResponse } from "next/server";
import slugify from "slugify";

// CREATE (POST) a news article
export async function POST(req) {
  try {
    const { id } = await auth();
    const formData = await req.formData();
    // Convert non-file fields to proper types
    const newsData = {
      title: formData.get("title"),
      content: formData.get("content"),
      slug: slugify(formData.get("title")),
      tags: JSON.parse(formData.get("tags") || "[]"),
      categoryId: formData.get("categoryId"),
      authorId: id,
    };
    // Handle file uploads
    const files = formData.getAll("images");

    const uploadedUrls = [];

    for (const file of files) {
      if (file && file instanceof File) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const uploadResponse = await imageKit.upload({
          file: buffer,
          fileName: file.name,
          folder: "/images/site/news",
        });
        uploadedUrls.push({
          url: uploadResponse.url,
          fileId: uploadResponse.fileId,
        });
      }
    }

    newsData.images = uploadedUrls;

    // Save news in DB
    const news = await db.news.create({
      data: newsData,
    });

    return NextResponse.json({ success: true, data: news }, { status: 201 });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: err.message || "Upload failed" },
      { status: 500 }
    );
  }
}

// GET all news articles
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const tag = searchParams.get("tag");
    const search = searchParams.get("search");

    const news = await db.news.findMany({
      where: {
        AND: [
          category ? { categoryId: category } : {},
          tag ? { tags: { has: tag } } : {},
          search
            ? {
                OR: [
                  { title: { contains: search, mode: "insensitive" } },
                  { content: { contains: search, mode: "insensitive" } },
                ],
              }
            : {},
        ],
      },
      include: {
        category: true,
        author: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(news);
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
