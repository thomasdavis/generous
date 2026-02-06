import { and, desc, eq, ilike, or } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getDb } from "@/server/db";
import { type NewTemplate, template, user } from "@/server/db/schema";

// GET /api/templates - Browse marketplace
export async function GET(req: Request) {
  const db = getDb();
  const url = new URL(req.url);

  const search = url.searchParams.get("search");
  const category = url.searchParams.get("category");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20", 10), 100);
  const offset = parseInt(url.searchParams.get("offset") || "0", 10);
  const sortBy = url.searchParams.get("sort") || "downloads";

  // Build query
  let query = db
    .select({
      template: template,
      authorName: user.name,
      authorImage: user.image,
    })
    .from(template)
    .innerJoin(user, eq(template.authorId, user.id))
    .where(eq(template.isPublished, true));

  // Apply filters
  const conditions = [eq(template.isPublished, true)];

  if (category) {
    conditions.push(eq(template.category, category));
  }

  if (search) {
    conditions.push(
      // biome-ignore lint/style/noNonNullAssertion: or() returns undefined only when called with no args
      or(ilike(template.name, `%${search}%`), ilike(template.description, `%${search}%`))!,
    );
  }

  if (conditions.length > 1) {
    query = query.where(and(...conditions));
  }

  // Apply sorting
  const orderColumn =
    sortBy === "rating"
      ? template.rating
      : sortBy === "newest"
        ? template.createdAt
        : template.downloads;

  const templates = await query.orderBy(desc(orderColumn)).limit(limit).offset(offset);

  // Get total count
  const allTemplates = await db
    .select()
    .from(template)
    .where(conditions.length > 1 ? and(...conditions) : conditions[0]);

  // Get unique categories
  const categoriesResult = await db
    .select({ category: template.category })
    .from(template)
    .where(eq(template.isPublished, true))
    .groupBy(template.category);

  const categories = [...new Set(categoriesResult.map((c) => c.category))];

  return Response.json({
    templates: templates.map((t) => ({
      ...t.template,
      authorName: t.authorName,
      authorImage: t.authorImage,
    })),
    total: allTemplates.length,
    categories,
    limit,
    offset,
  });
}

// POST /api/templates - Submit a template
export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const body = await req.json();

  if (!body.name || !body.category || !body.content) {
    return Response.json({ error: "name, category, and content are required" }, { status: 400 });
  }

  const newTemplate: NewTemplate = {
    id: crypto.randomUUID(),
    name: body.name,
    description: body.description || null,
    category: body.category,
    authorId: session.user.id,
    content: body.content,
    thumbnail: body.thumbnail || null,
    isPublished: body.isPublished ?? false,
    tags: body.tags ?? [],
  };

  await db.insert(template).values(newTemplate);

  return Response.json(newTemplate, { status: 201 });
}
