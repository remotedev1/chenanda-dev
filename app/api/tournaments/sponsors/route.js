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
});

/* ---------------- HANDLERS ---------------- */

async function handleGet(request) {
  // Setup (auth + rate limit)
  const setup = await setupApiHandler(
    request,
    "sponsors:list",
    (requireAuthentication = false),
  );
  if (setup.error) return setup.error;

  // Query params
  const { searchParams } = new URL(request.url);

  const validated = querySchema.parse({
    page: searchParams.get("page"),
    limit: searchParams.get("limit"),
    search: searchParams.get("search") || undefined,
    status: searchParams.get("status") || undefined,
    sortBy: searchParams.get("sortBy") || undefined,
    sortOrder: searchParams.get("sortOrder") || undefined,
  });

  const { page, limit, skip } = parsePagination(searchParams);

  // Build where clause
  const where = {
    ...buildSearchWhere(validated.search, ["name", "description"]),
    ...(validated.status && { status: validated.status }),
  };

  console.log(where);

  // Fetch data with counts
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
  // Setup (auth + rate limit)
  const setup = await setupApiHandler(request, "sponsors:create");
  if (setup.error) return setup.error;

  const { user } = await auth();

  // Ability check
  // const ability = defineAbilityFor(user);
  // if (!ability.can(ACTIONS.CREATE, RESOURCES.SPONSOR)) {
  //   return errorResponse(
  //     "You don't have permission to create sponsors",
  //     403
  //   );
  // }

  // Validate body
  const body = await request.json();
  const validated = createSponsorSchema.parse(body);

  // Check for duplicate name
  const existing = await db.sponsor.findFirst({
    where: { name: validated.name },
  });

  if (existing) {
    return errorResponse("A sponsor with this name already exists", 409);
  }

  // Create sponsor
  const sponsor = await db.sponsor.create({
    data: {
      name: validated.name,
      description: validated.description,
      website: validated.website || null,
      email: validated.email || null,
      phone: validated.phone || null,
      logo: validated.logo || null,
      status: validated.status,
      createdBy: {
        connect: { id: user.id },
      },
    },
  });

  // Log activity
  await logActivity({
    userId: setup.user.userId,
    action: "created",
    entity: "sponsor",
    entityId: sponsor.id,
    entityName: sponsor.name,
    description: `Created sponsor "${sponsor.name}"`,
    request,
  });

  return successResponse(sponsor, "Sponsor created successfully", 201);
}

/* ---------------- EXPORTS ---------------- */

export const GET = withErrorHandling(handleGet, "sponsors");
export const POST = withErrorHandling(handlePost, "sponsor");
