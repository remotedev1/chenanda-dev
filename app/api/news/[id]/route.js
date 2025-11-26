import { db } from "@/lib/db";
import { imageKit } from "@/lib/imageKit";
import { NextResponse } from "next/server";

// GET single article by id
export async function GET(req, { params }) {
  try {
    const news = await db.news.findUnique({
      where: { id: params.id },
      include: { category: true, author: true },
    });

    if (!news) {
      return Response.json({ error: "News not found" }, { status: 404 });
    }

    return Response.json(news);
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// UPDATE article
export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const formData = await req.formData();
    // Convert non-file fields to proper types
    const newsData = {
      title: formData.get("title"),
      content: formData.get("content"),
      tags: JSON.parse(formData.get("tags") || "[]"),
      isPublished: formData.get("isPublished") === "true",
    };


    // Get the existing news
    const existingNews = await db.news.findUnique({ where: { id } });
    if (!existingNews) {
      return NextResponse.json({ error: "News not found" }, { status: 404 });
    }

    // deleted ids coming from client
    const deletedFileIds = JSON.parse(formData.get("deletedFileIds") || "[]");
    const deletedSet = new Set(deletedFileIds);

    // keep only the existing images that were NOT deleted
    const keptExisting = (existingNews.images || []).filter(
      (img) => !deletedSet.has(img.fileId)
    );

    // delete from ImageKit
    for (const fileId of deletedSet) {
      try {
        await imageKit.deleteFile(fileId);
      } catch (e) {
        console.warn("Failed to delete from ImageKit:", fileId, e);
      }
    }

    // upload new files
    const newUploads = [];
    for (const entry of formData.getAll("images")) {
      if (entry instanceof File) {
        const buffer = Buffer.from(await entry.arrayBuffer());
        const uploaded = await imageKit.upload({
          file: buffer,
          fileName: entry.name,
          folder: "/images/site/news",
        });
        newUploads.push({ url: uploaded.url, fileId: uploaded.fileId });
      }
    }

    // final gallery = kept existing + newly uploaded
    newsData.images = [...keptExisting, ...newUploads];
    // Update news in DB
    const updatedNews = await db.news.update({
      where: { id },
      data: newsData,
    });

    return NextResponse.json({ success: true, data: updatedNews });
  } catch (err) {
    console.error("Update error:", err);
    return NextResponse.json(
      { error: err.message || "Update failed" },
      { status: 500 }
    );
  }
}

// DELETE article
export async function DELETE(req, { params }) {
  try {
    await db.news.delete({ where: { id: params.id } });
    return Response.json({ success: true, message: "News deleted" });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
