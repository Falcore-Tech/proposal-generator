import { and, count, desc, eq, isNotNull, isNull, type SQL } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, animatedProposals, packages, tosTemplates } from "@/lib/db";
import { requireAuth } from "@/lib/auth/api";
import { createAnimatedProposalSchema } from "@/lib/animated-proposal-schema";
import { validateAnimatedProposal } from "@/lib/animated-proposal-validation";
import { generateOrderId, getNextSequentialNumber } from "@/lib/orderIdGenerator";
import { getPostHogClient } from "@/lib/posthog-server";

const UNIQUE_VIOLATION = "23505";

export async function POST(request: Request) {
  const { user, error: authError } = await requireAuth();
  if (authError) return authError;

  const parsed = createAnimatedProposalSchema.safeParse({ ...(await request.json()), created_by: user.id });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { package_id, tos_template_id, override_warnings: _ow, ...insertData } = parsed.data;

  const [pkg] = package_id
    ? await db.select({ price: packages.price, currency: packages.currency, usd_price: packages.usd_price }).from(packages).where(eq(packages.id, package_id)).limit(1)
    : [];
  const [tos] = tos_template_id
    ? await db.select({ terms: tosTemplates.terms }).from(tosTemplates).where(eq(tosTemplates.id, tos_template_id)).limit(1)
    : [];

  const { warnings } = validateAnimatedProposal(parsed.data, pkg ? { ...pkg, currency: pkg.currency ?? "AED" } : null, tos ?? null);
  const order_id = generateOrderId(await getNextSequentialNumber());

  try {
    const [data] = await db
      .insert(animatedProposals)
      .values({ ...insertData, package_id: package_id ?? null, tos_template_id: tos_template_id ?? null, created_by: user.id, status: "sent", order_id } as never)
      .returning();

    getPostHogClient().capture({
      distinctId: user.id,
      event: "animated_proposal_created",
      properties: {
        proposal_id: data.id,
        company_name: data.company_name,
        project_title: data.project_title,
        currency: data.currency,
        total_price_cents: data.total_price_cents,
      },
    });

    return NextResponse.json({ ...data, warnings }, { status: 201 });
  } catch (error) {
    if ((error as { code?: string }).code === UNIQUE_VIOLATION) {
      return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
    }
    throw error;
  }
}

export async function GET(request: Request) {
  const { error: authError } = await requireAuth();
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const archivedOnly = searchParams.get("archivedOnly") === "true";
  const includeArchived = searchParams.get("includeArchived") !== "false";
  const createdBy = searchParams.get("createdBy");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "100");
  const offset = (page - 1) * limit;

  const conditions: SQL[] = [];
  if (archivedOnly) conditions.push(isNotNull(animatedProposals.archived_at));
  else if (!includeArchived) conditions.push(isNull(animatedProposals.archived_at));
  if (status) conditions.push(eq(animatedProposals.status, status as never));
  if (createdBy) conditions.push(eq(animatedProposals.created_by, createdBy));
  const where = conditions.length ? and(...conditions) : undefined;

  const [data, [{ total }]] = await Promise.all([
    db
      .select({
        id: animatedProposals.id,
        token: animatedProposals.token,
        slug: animatedProposals.slug,
        status: animatedProposals.status,
        client_full_name: animatedProposals.client_full_name,
        company_name: animatedProposals.company_name,
        project_title: animatedProposals.project_title,
        total_price_cents: animatedProposals.total_price_cents,
        currency: animatedProposals.currency,
        order_id: animatedProposals.order_id,
        created_at: animatedProposals.created_at,
        updated_at: animatedProposals.updated_at,
        archived_at: animatedProposals.archived_at,
        expires_at: animatedProposals.expires_at,
        created_by: animatedProposals.created_by,
        client_signed_at: animatedProposals.client_signed_at,
        provider_signed_at: animatedProposals.provider_signed_at,
      })
      .from(animatedProposals)
      .where(where)
      .orderBy(desc(animatedProposals.created_at))
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(animatedProposals).where(where),
  ]);

  return NextResponse.json({ data, count: total, page, limit });
}
