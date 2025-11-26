import { db } from "@/lib/db";
import { imageKit } from "@/lib/imageKit";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const formData = await req.formData();

    // Parse basic fields
    const projectData = {
      projectName: formData.get("projectName"),
      projectType: formData.get("projectType"),
      location: formData.get("location"),
      status: formData.get("status"),
      overview: formData.get("overview"),
      objectives: JSON.parse(formData.get("objectives") || "[]"),
      keyFeatures: JSON.parse(formData.get("keyFeatures") || "[]"),
      technologiesUsed: JSON.parse(formData.get("technologiesUsed") || "[]"),
      youtubeLinks: JSON.parse(formData.get("youtubeLinks") || "[]"),
      instagramLinks: JSON.parse(formData.get("instagramLinks") || "[]"),
    };

    // Get the existing project
    const existingProject = await db.projects.findUnique({ where: { id } });
    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // deleted ids coming from client
    const deletedFileIds = JSON.parse(formData.get("deletedFileIds") || "[]");
    const deletedSet = new Set(deletedFileIds);

    // keep only the existing images that were NOT deleted
    const keptExisting = (existingProject.imageGallery || []).filter(
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
    for (const entry of formData.getAll("imageGallery")) {
      if (entry instanceof File) {
        const buffer = Buffer.from(await entry.arrayBuffer());
        const uploaded = await imageKit.upload({
          file: buffer,
          fileName: entry.name,
          folder: "/images/site/projects",
        });
        newUploads.push({ url: uploaded.url, fileId: uploaded.fileId });
      }
    }

    // final gallery = kept existing + newly uploaded
    projectData.imageGallery = [...keptExisting, ...newUploads];

    const updated = await db.projects.update({
      where: { id },
      data: projectData,
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Update error:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params;

    const project = await db.projects.findUnique({ where: { id } });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Delete images from ImageKit
    for (const image of project.imageGallery || []) {
      try {
        await imageKit.deleteFile(image.fileId);
      } catch (err) {
        console.warn(`Failed to delete ${image.url} from ImageKit`, err);
      }
    }

    // Delete project from DB
    await db.projects.delete({ where: { id } });

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
