// app/api/blog/[slug]/route.ts
export async function GET(req, { params }) {
  const post = await db.blogPost.findUnique({
    where: { slug: params.slug },
  });

  if (!post) return new NextResponse("Post not found", { status: 404 });

  return NextResponse.json(post);
}

export async function PATCH(req, { params }) {
  const body = await req.json();

  const updated = await db.blogPost.update({
    where: { slug: params.slug },
    data: {
      ...body,
      updatedAt: new Date(),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req, { params }) {
  await db.blogPost.delete({
    where: { slug: params.slug },
  });

  return new NextResponse("Deleted", { status: 200 });
}
