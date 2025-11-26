import { db } from "@/lib/db";
import { CategorySchema } from "@/schemas";

// CREATE category
export async function POST(req) {
  try {
    const body = await req.json();
    const data = CategorySchema.parse(body);

    const category = await db.category.create({
      data: {
        name: data.name,
        slug: data.slug,
      },
    });

    return Response.json({ success: true, data: category }, { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 400 });
  }
}

// GET all categories
export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: { name: "asc" },
    });

    return Response.json(categories);
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
