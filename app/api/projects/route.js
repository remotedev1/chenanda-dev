import { db } from "@/lib/db";
import { imageKit } from "@/lib/imageKit";
import { NextResponse } from "next/server";

export async function GET() {
  const projects = await db.projects.findMany();
  return NextResponse.json(projects);
}

export async function POST(req) {
  try {
    const formData = await req.formData();

    // Convert non-file fields to an object
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

    // Handle file uploads
    const files = formData.getAll("imageGallery");
    const uploadedUrls = [];

    for (const file of files) {
      if (file && file instanceof File) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const uploadResponse = await imageKit.upload({
          file: buffer,
          fileName: file.name,
          folder: "/images/site/projects",
        });
        uploadedUrls.push({
          url: uploadResponse.url,
          fileId: uploadResponse.fileId,
        });
      }
    }

    projectData.imageGallery = uploadedUrls;

    // Save project in DB
    const project = await db.projects.create({ data: projectData });

    return NextResponse.json(project);
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
