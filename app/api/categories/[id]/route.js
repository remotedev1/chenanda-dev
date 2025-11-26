import { db } from "@/lib/db";
import { CategoryUpdateSchema } from "@/schemas";


// GET single category
export async function GET(
  req,
  { params }
) {
  try {
    const category = await db.category.findUnique({
      where: { id: params.id },
      include: { news: true }, // include related news if needed
    });

    if (!category) {
      return Response.json({ error: "Category not found" }, { status: 404 });
    }

    return Response.json(category);
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// UPDATE category
export async function PATCH(
  req,
  { params }
) {
  try {
    const body = await req.json();
    const data = CategoryUpdateSchema.parse(body);

    const updated = await db.category.update({
      where: { id: params.id },
      data,
    });

    return Response.json({ success: true, data: updated });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 400 });
  }
}

// DELETE category
export async function DELETE(
  req,
  { params }
) {
  try {
    await db.category.delete({
      where: { id: params.id },
    });

    return Response.json({ success: true, message: "Category deleted" });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
