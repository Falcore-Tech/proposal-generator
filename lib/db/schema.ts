import {
  bigint,
  bigserial,
  boolean,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import type { ProposalCard, ScopeItem, TermsClause, TimelineNode } from "@/types/animated-proposal";

export const USER_ROLES = ["admin", "sales_rep", "deactivated"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const PROPOSAL_STATUSES = [
  "draft",
  "pending_approval",
  "approved",
  "sent",
  "client_signed",
  "counter_signed",
  "paid",
  "archived",
] as const;
export type ProposalStatus = (typeof PROPOSAL_STATUSES)[number];

export const PROPOSAL_EVENT_TYPES = ["view", "scroll_complete", "sign_start", "sign_submit", "stripe_click"] as const;
export type ProposalEventType = (typeof PROPOSAL_EVENT_TYPES)[number];

export const PAYMENT_TYPES = ["full", "split", "custom"] as const;

const timestamps = {
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
};

export const profiles = pgTable("profiles", {
  id: text("id").primaryKey(),
  email: text("email"),
  name: text("name"),
  avatar_url: text("avatar_url"),
  role: text("role", { enum: USER_ROLES }),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" }),
});

export const packages = pgTable("packages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  price: numeric("price", { precision: 10, scale: 2, mode: "number" }).notNull(),
  currency: text("currency").default("AED"),
  description: text("description"),
  is_popular: boolean("is_popular").default(false),
  usd_price: numeric("usd_price", { precision: 10, scale: 2, mode: "number" }),
  ...timestamps,
});

export const packageFeatures = pgTable(
  "package_features",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    package_id: text("package_id").references(() => packages.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    order_index: integer("order_index").notNull(),
    is_bold: boolean("is_bold").default(false),
    is_included: boolean("is_included").default(true),
  },
  (table) => [index("idx_package_features_package_id").on(table.package_id)]
);

export const tosTemplates = pgTable(
  "tos_templates",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    description: text("description"),
    payment_type: text("payment_type", { enum: PAYMENT_TYPES }),
    terms: jsonb("terms").$type<TermsClause[]>().notNull().default([]),
    variables: jsonb("variables").$type<Record<string, unknown>>().default({}),
    is_active: boolean("is_active").default(true),
    ...timestamps,
    created_by: text("created_by"),
  },
  (table) => [index("idx_tos_templates_active").on(table.is_active)]
);

export const packageTosMappings = pgTable(
  "package_tos_mappings",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    package_id: text("package_id").references(() => packages.id, { onDelete: "cascade" }),
    tos_template_id: text("tos_template_id").references(() => tosTemplates.id, { onDelete: "cascade" }),
    is_default: boolean("is_default").default(false),
    created_at: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  },
  (table) => [
    unique().on(table.package_id, table.tos_template_id),
    index("idx_package_tos_mappings_package").on(table.package_id),
  ]
);

export const animatedProposals = pgTable(
  "animated_proposals",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    token: text("token").notNull().unique().$defaultFn(() => crypto.randomUUID().replace(/-/g, "")),
    slug: text("slug").notNull().unique(),
    status: text("status", { enum: PROPOSAL_STATUSES }).notNull().default("draft"),
    created_by: text("created_by").notNull(),
    approved_by: text("approved_by"),
    approved_at: timestamp("approved_at", { withTimezone: true, mode: "string" }),
    archived_at: timestamp("archived_at", { withTimezone: true, mode: "string" }),
    package_id: text("package_id").references(() => packages.id, { onDelete: "set null" }),
    tos_template_id: text("tos_template_id").references(() => tosTemplates.id, { onDelete: "set null" }),
    client_first_name: text("client_first_name").notNull(),
    client_full_name: text("client_full_name").notNull(),
    company_name: text("company_name").notNull(),
    project_title: text("project_title").notNull(),
    provider_name: text("provider_name").notNull(),
    agency_name: text("agency_name").notNull().default("Falcore"),
    proposal_date: date("proposal_date", { mode: "string" }).notNull().defaultNow(),
    intro_paragraph: text("intro_paragraph").notNull(),
    challenge_intro: text("challenge_intro").notNull(),
    problems: jsonb("problems").$type<ProposalCard[]>().notNull(),
    solution_intro: text("solution_intro").notNull(),
    solutions: jsonb("solutions").$type<ProposalCard[]>().notNull(),
    scope_phase_name: text("scope_phase_name"),
    scope_subtitle: text("scope_subtitle"),
    scope_items: jsonb("scope_items").$type<ScopeItem[]>().notNull().default([]),
    timeline_nodes: jsonb("timeline_nodes").$type<TimelineNode[]>().notNull().default([]),
    retainer_bullets: jsonb("retainer_bullets").$type<string[]>().notNull().default([]),
    total_price_cents: bigint("total_price_cents", { mode: "number" }).notNull(),
    milestone_cents: bigint("milestone_cents", { mode: "number" }),
    retainer_price_cents: bigint("retainer_price_cents", { mode: "number" }),
    currency: text("currency").notNull().default("AED"),
    total_days: integer("total_days"),
    payment_options_text: text("payment_options_text"),
    guarantee_text: text("guarantee_text"),
    phase_two_teaser: text("phase_two_teaser"),
    terms: jsonb("terms").$type<TermsClause[]>().notNull().default([]),
    stripe_link: text("stripe_link"),
    stripe_payment_intent_id: text("stripe_payment_intent_id"),
    order_id: text("order_id"),
    client_signature_url: text("client_signature_url"),
    client_signed_at: timestamp("client_signed_at", { withTimezone: true, mode: "string" }),
    provider_signature_url: text("provider_signature_url"),
    provider_signed_at: timestamp("provider_signed_at", { withTimezone: true, mode: "string" }),
    signed_pdf_url: text("signed_pdf_url"),
    theme: text("theme"),
    expires_at: timestamp("expires_at", { withTimezone: true, mode: "string" }),
    ...timestamps,
  },
  (table) => [
    index("animated_proposals_created_by_idx").on(table.created_by),
    index("animated_proposals_status_idx").on(table.status),
    index("animated_proposals_order_id_idx").on(table.order_id),
  ]
);

export const animatedProposalEvents = pgTable(
  "animated_proposal_events",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    proposal_id: text("proposal_id")
      .notNull()
      .references(() => animatedProposals.id, { onDelete: "cascade" }),
    event_type: text("event_type", { enum: PROPOSAL_EVENT_TYPES }).notNull(),
    meta: jsonb("meta").$type<Record<string, unknown>>(),
    ip: text("ip"),
    ua: text("ua"),
    created_at: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  },
  (table) => [index("animated_proposal_events_proposal_idx").on(table.proposal_id, table.event_type)]
);

export const appSettings = pgTable("app_settings", {
  id: boolean("id").primaryKey().default(true),
  proposal_theme: text("proposal_theme").notNull().default("latte"),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  updated_by: text("updated_by"),
});

export type Profile = typeof profiles.$inferSelect;
export type Package = typeof packages.$inferSelect;
export type PackageFeature = typeof packageFeatures.$inferSelect;
export type TosTemplate = typeof tosTemplates.$inferSelect;
export type PackageTosMapping = typeof packageTosMappings.$inferSelect;
export type AnimatedProposalRow = typeof animatedProposals.$inferSelect;
export type AnimatedProposalInsert = typeof animatedProposals.$inferInsert;
export type AnimatedProposalEventRow = typeof animatedProposalEvents.$inferSelect;
export type AppSettings = typeof appSettings.$inferSelect;
