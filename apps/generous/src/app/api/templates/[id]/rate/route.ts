import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getDb } from "@/server/db";
import { type NewTemplateRating, template, templateRating } from "@/server/db/schema";

// POST /api/templates/[id]/rate - Rate a template
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const body = await req.json();

  const { rating, comment } = body;

  if (!rating || rating < 1 || rating > 5) {
    return Response.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
  }

  // Find template
  const templates = await db.select().from(template).where(eq(template.id, id));
  if (templates.length === 0) {
    return Response.json({ error: "Template not found" }, { status: 404 });
  }

  const t = templates[0];

  // Check if published
  if (!t.isPublished) {
    return Response.json({ error: "Cannot rate unpublished template" }, { status: 400 });
  }

  // Check if already rated
  const existingRating = await db
    .select()
    .from(templateRating)
    .where(and(eq(templateRating.templateId, id), eq(templateRating.userId, session.user.id)));

  if (existingRating.length > 0) {
    // Update existing rating
    await db
      .update(templateRating)
      .set({ rating, comment: comment || null })
      .where(eq(templateRating.id, existingRating[0].id));
  } else {
    // Create new rating
    const newRating: NewTemplateRating = {
      id: crypto.randomUUID(),
      templateId: id,
      userId: session.user.id,
      rating,
      comment: comment || null,
    };

    await db.insert(templateRating).values(newRating);
  }

  // Calculate new average rating
  const allRatings = await db
    .select({ rating: templateRating.rating })
    .from(templateRating)
    .where(eq(templateRating.templateId, id));

  const avgRating =
    allRatings.length > 0
      ? Math.round((allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length) * 100)
      : null;

  // Update template
  await db
    .update(template)
    .set({
      rating: avgRating,
      ratingCount: allRatings.length,
    })
    .where(eq(template.id, id));

  return Response.json({
    rating,
    averageRating: avgRating ? avgRating / 100 : null,
    ratingCount: allRatings.length,
  });
}

// GET /api/templates/[id]/rate - Get user's rating
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();

  const ratings = await db
    .select()
    .from(templateRating)
    .where(and(eq(templateRating.templateId, id), eq(templateRating.userId, session.user.id)));

  if (ratings.length === 0) {
    return Response.json({ rating: null });
  }

  return Response.json({
    rating: ratings[0].rating,
    comment: ratings[0].comment,
  });
}
