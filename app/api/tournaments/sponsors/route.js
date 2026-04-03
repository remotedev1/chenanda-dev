// app/api/sponsors/route.js
import { z } from "zod";
import { db } from "@/lib/db";
import {
  setupApiHandler,
  parsePagination,
  buildPaginationResponse,
  buildSearchWhere,
  successResponse,
  errorResponse,
  logActivity,
  withErrorHandling,
} from "@/lib/api/helpers";
import { auth } from "@/auth";

/* ---------------- SCHEMAS ---------------- */

const querySchema = z.object({
  page: z.string().default("1"),
  limit: z.string().default("10"),
  search: z.string().optional(),
  status: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  category: z.enum(["TITLE", "GOLD", "SILVER", "BRONZE"]).optional(),
  sortBy: z.enum(["createdAt", "name", "status"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const createSponsorSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  website: z.string().url("Invalid URL format").optional().or(z.literal("")),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  phone: z.string().max(20, "Phone must be less than 20 characters").optional(),
  logo: z
    .array(
      z.object({
        url: z.string().url("Invalid logo URL"),
        id: z.string(),
      }),
    )
    .max(1)
    .optional()
    .or(z.literal("")),
  status: z.boolean().default(true),
  category: z.enum(["TITLE", "GOLD", "SILVER", "BRONZE"], {
    required_error: "Category is required",
    invalid_type_error: "Invalid category",
  }),
});

/* ---------------- HANDLERS ---------------- */

async function handleGet(request) {
  const setup = await setupApiHandler(request, "sponsors:list", {
    requireAuthentication: false,
  });
  if (setup.error) return setup.error;

  const { searchParams } = new URL(request.url);
  const validated = querySchema.parse({
    page: searchParams.get("page"),
    limit: searchParams.get("limit"),
    search: searchParams.get("search") || undefined,
    status: searchParams.get("status") || undefined,
    category: searchParams.get("category") || undefined,
    sortBy: searchParams.get("sortBy") || undefined,
    sortOrder: searchParams.get("sortOrder") || undefined,
  });

  const { page, limit, skip } = parsePagination(searchParams);

  const where = {
    ...buildSearchWhere(validated.search, ["name", "description"]),
    ...(validated.status !== undefined && { status: validated.status }),
    ...(validated.category && { category: validated.category }),
  };

  const [sponsors, total] = await Promise.all([
    db.sponsor.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [validated.sortBy]: validated.sortOrder },
    }),
    db.sponsor.count({ where }),
  ]);

  return successResponse({
    data: sponsors,
    ...buildPaginationResponse(page, limit, total, sponsors),
  });
}

async function handlePost(request) {
  const setup = await setupApiHandler(request, "sponsors:create");
  if (setup.error) return setup.error;

  const { user } = await auth();

  const body = await request.json();
  const validated = createSponsorSchema.parse(body);

  const existing = await db.sponsor.findFirst({
    where: { name: validated.name },
  });

  if (existing) {
    return errorResponse("A sponsor with this name already exists", 409);
  }

  const sponsor = await db.sponsor.create({
    data: {
      name: validated.name,
      description: validated.description,
      website: validated.website || null,
      email: validated.email || null,
      phone: validated.phone || null,
      logo: validated.logo || null,
      status: validated.status,
      category: validated.category,
      createdBy: {
        connect: { id: user.id },
      },
    },
  });

  await logActivity({
    userId: user.id,
    action: "created",
    entity: "sponsor",
    entityId: sponsor.id,
    entityName: sponsor.name,
    description: `Created sponsor "${sponsor.name}" as ${validated.category} sponsor`,
    request,
  });

  return successResponse(sponsor, "Sponsor created successfully", 201);
}

/* ---------------- EXPORTS ---------------- */

export const GET = withErrorHandling(handleGet, "sponsors");
export const POST = withErrorHandling(handlePost, "sponsor");
