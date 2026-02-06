import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getDb } from "@/server/db";
import {
  type NewScheduledJob,
  type NewWebhook,
  scheduledJob,
  webhook,
  workflow,
} from "@/server/db/schema";

// Parse cron expression to get next run time
function getNextRunTime(cronExpression: string, _timezone: string = "UTC"): Date {
  // Simple cron parser for common patterns
  // Format: minute hour day month dayOfWeek
  const _parts = cronExpression.split(" ");
  const now = new Date();

  // For now, simple implementation - just add the interval based on pattern
  // In production, use a proper cron parser like 'cron-parser'
  if (cronExpression === "* * * * *") {
    // Every minute
    return new Date(now.getTime() + 60 * 1000);
  } else if (cronExpression.startsWith("*/5")) {
    // Every 5 minutes
    return new Date(now.getTime() + 5 * 60 * 1000);
  } else if (cronExpression.startsWith("*/15")) {
    // Every 15 minutes
    return new Date(now.getTime() + 15 * 60 * 1000);
  } else if (cronExpression.startsWith("0 *")) {
    // Every hour
    return new Date(now.getTime() + 60 * 60 * 1000);
  } else if (cronExpression.startsWith("0 0")) {
    // Every day at midnight
    const next = new Date(now);
    next.setHours(24, 0, 0, 0);
    return next;
  }

  // Default: next minute
  return new Date(now.getTime() + 60 * 1000);
}

// POST /api/workflows/[id]/schedule - Create or update schedule
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const body = await req.json();

  // Find workflow and check ownership
  const workflows = await db.select().from(workflow).where(eq(workflow.id, id));
  if (workflows.length === 0) {
    return Response.json({ error: "Workflow not found" }, { status: 404 });
  }

  const workflowRecord = workflows[0];
  if (workflowRecord.ownerId !== session.user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { type, cronExpression, timezone = "UTC" } = body;

  if (type === "cron") {
    if (!cronExpression) {
      return Response.json({ error: "cronExpression required" }, { status: 400 });
    }

    // Check for existing schedule
    const existing = await db.select().from(scheduledJob).where(eq(scheduledJob.workflowId, id));

    if (existing.length > 0) {
      // Update existing
      await db
        .update(scheduledJob)
        .set({
          cronExpression,
          timezone,
          isEnabled: true,
          nextRun: getNextRunTime(cronExpression, timezone),
        })
        .where(eq(scheduledJob.id, existing[0].id));

      const updated = await db
        .select()
        .from(scheduledJob)
        .where(eq(scheduledJob.id, existing[0].id));

      return Response.json(updated[0]);
    }

    // Create new schedule
    const newSchedule: NewScheduledJob = {
      id: crypto.randomUUID(),
      workflowId: id,
      cronExpression,
      timezone,
      isEnabled: true,
      nextRun: getNextRunTime(cronExpression, timezone),
    };

    await db.insert(scheduledJob).values(newSchedule);

    return Response.json(newSchedule, { status: 201 });
  }

  if (type === "webhook") {
    // Check for existing webhook
    const existing = await db.select().from(webhook).where(eq(webhook.workflowId, id));

    if (existing.length > 0) {
      // Return existing webhook
      return Response.json(existing[0]);
    }

    // Create new webhook
    const webhookUrl = `wh-${crypto.randomBytes(16).toString("hex")}`;
    const webhookSecret = crypto.randomBytes(32).toString("hex");

    const newWebhook: NewWebhook = {
      id: crypto.randomUUID(),
      workflowId: id,
      url: webhookUrl,
      secret: webhookSecret,
      isEnabled: true,
    };

    await db.insert(webhook).values(newWebhook);

    return Response.json(newWebhook, { status: 201 });
  }

  return Response.json({ error: "Invalid trigger type" }, { status: 400 });
}

// GET /api/workflows/[id]/schedule - Get schedule info
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();

  // Find workflow and check ownership
  const workflows = await db.select().from(workflow).where(eq(workflow.id, id));
  if (workflows.length === 0) {
    return Response.json({ error: "Workflow not found" }, { status: 404 });
  }

  const workflowRecord = workflows[0];
  if (workflowRecord.ownerId !== session.user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get schedule
  const schedules = await db.select().from(scheduledJob).where(eq(scheduledJob.workflowId, id));

  // Get webhook
  const webhooks = await db.select().from(webhook).where(eq(webhook.workflowId, id));

  return Response.json({
    schedule: schedules[0] || null,
    webhook: webhooks[0] || null,
  });
}

// DELETE /api/workflows/[id]/schedule - Remove schedule
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const url = new URL(req.url);
  const type = url.searchParams.get("type");

  // Find workflow and check ownership
  const workflows = await db.select().from(workflow).where(eq(workflow.id, id));
  if (workflows.length === 0) {
    return Response.json({ error: "Workflow not found" }, { status: 404 });
  }

  const workflowRecord = workflows[0];
  if (workflowRecord.ownerId !== session.user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  if (type === "cron") {
    await db.delete(scheduledJob).where(eq(scheduledJob.workflowId, id));
  } else if (type === "webhook") {
    await db.delete(webhook).where(eq(webhook.workflowId, id));
  } else {
    // Delete both
    await db.delete(scheduledJob).where(eq(scheduledJob.workflowId, id));
    await db.delete(webhook).where(eq(webhook.workflowId, id));
  }

  return Response.json({ success: true });
}
