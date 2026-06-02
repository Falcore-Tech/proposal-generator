import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_SECRET_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
if (usersError) throw usersError;
const owner = usersData.users[0];
if (!owner) throw new Error("No auth user found to set as created_by");

const payload = {
  slug: "chad-elite-media-may2026",
  client_first_name: "Chad",
  client_full_name: "Chad McCullough",
  company_name: "Elite Media, Inc.",
  project_title: "AI Proposal Generator for Elite Media",
  provider_name: "Faez",
  agency_name: "Falcore",
  created_by: owner.id,
  status: "sent",
  currency: "USD",

  intro_paragraph:
    "Chad, Elite Media owns some of the most visible real estate in Las Vegas — the wraps, the spectaculars, the taxi fleet, the convention placements. But the proposal that sells those placements is still a hand-built deck. This is about giving your sales process the same high-impact polish as the inventory it's selling, and getting it out the door in minutes instead of an afternoon.",
  challenge_intro:
    "Elite Media sells premium, high-impact out-of-home media — but the proposals that win those deals are slow to produce and don't reflect the visual punch of the product.",
  problems: [
    {
      title: "Every Proposal Built by Hand",
      desc: "Each advertiser deck is rebuilt from scratch — pulling placement specs, photos, and pricing into a template. At 14 people, that's senior sales time spent on copy-paste instead of closing.",
      icon_key: "manual_ops",
    },
    {
      title: "Static Decks for a Visual Product",
      desc: "You sell wallscapes, building wraps, and digital spectaculars — yet the pitch lands as a flat PDF. The medium that wins your clients' campaigns isn't working for your own.",
      icon_key: "inefficiency",
    },
    {
      title: "Slow Turnaround Loses Deals",
      desc: "Advertisers shopping Vegas inventory compare vendors fast. Whoever sends a sharp, personalized proposal first sets the anchor. Hours of build time is hours a competitor uses to get there first.",
      icon_key: "lead_leakage",
    },
  ],

  solution_intro:
    "A branded AI proposal engine built around Elite Media's inventory — feed in the advertiser and the placements, get a personalized, animated proposal ready to send in about five minutes.",
  solutions: [
    {
      title: "AI Generation Engine",
      desc: "Drop in the advertiser's details and the placements you're pitching. The system drafts a tailored, on-brand proposal — narrative, scope, and pricing — in roughly five minutes. Same outcome we built for our own pipeline: 30 minutes down to 5.",
      icon_key: "automation",
    },
    {
      title: "Animated, On-Brand Proposals",
      desc: "Interactive, motion-driven proposals themed to Elite Media — so the pitch carries the same high-impact feel as the spectaculars and wraps it's selling. Built to view great on a phone in a client meeting.",
      icon_key: "visibility",
    },
    {
      title: "E-Sign, Pay & Track Built In",
      desc: "Send one link. The advertiser reviews, signs, and can pay against a milestone without leaving the page — and you see exactly when they opened it and how far they read.",
      icon_key: "revenue",
    },
  ],

  scope_phase_name: "Phase 1: Build & Launch",
  scope_subtitle: "Your inventory, your brand, generating proposals",
  scope_items: [
    { title: "Discovery & Brand Capture", desc: "Working session to map your placement catalog, pricing logic, and brand system into the generator." },
    { title: "Elite Media Theming", desc: "Animated proposal experience themed to your identity — colors, type, motion — matching the visual standard of your media." },
    { title: "Inventory Template Library", desc: "Reusable proposal blocks for your core products: building wraps, wallscapes, billboards, digital spectaculars, taxi media, and convention placements." },
    { title: "AI Generation Engine", desc: "Claude-powered drafting that turns an advertiser brief + selected placements into a complete, personalized proposal." },
    { title: "E-Signature & Payment", desc: "Client e-sign flow plus Stripe milestone payment link, embedded directly in the proposal." },
    { title: "Tracking Dashboard", desc: "See proposal status — sent, viewed, signed — and read-depth analytics in one view." },
    { title: "Deploy on Your Infrastructure", desc: "Hosted on your accounts and domain. You own the code outright — no vendor lock-in, no per-seat fees." },
    { title: "Team Training & Handover", desc: "Live walkthrough for your sales team plus a short reference guide so they're self-sufficient day one." },
  ],

  timeline_nodes: [
    { label: "Onboarding & Brand Capture", days: 1, desc: "Kickoff, brand assets, and inventory catalog collected." },
    { label: "Template Library", days: 5, desc: "Proposal blocks built for each Elite Media product line." },
    { label: "AI Engine + E-Sign", days: 12, desc: "Generation engine, signing, and payment wired together." },
    { label: "Testing & Training", days: 16, desc: "End-to-end testing and live team walkthrough." },
    { label: "Launch & Handover", days: 20, desc: "Deployed on your infrastructure and handed over." },
  ],
  total_days: 20,

  retainer_bullets: [
    "Ongoing hosting, monitoring, and updates",
    "New inventory templates as you add placements",
    "Priority support and small enhancements",
  ],

  total_price_cents: 750000,
  milestone_cents: 375000,
  retainer_price_cents: 50000,

  guarantee_text:
    "If the generator doesn't produce send-ready, on-brand proposals in a fraction of your current build time, we keep working — at our cost — until it does. You don't pay the final milestone until it's doing the job.",

  phase_two_teaser:
    "Phase 2: a self-serve advertiser portal where repeat clients configure and request placements directly, feeding straight into the proposal engine.",

  payment_options_text:
    "50% to start, 50% on delivery. Optional support retainer at $500/mo after launch.",

  terms: [
    { clause_no: "01", title: "Scope", body: "Work is delivered per the scope items listed above. Additions or changes require written approval from both parties before work begins." },
    { clause_no: "02", title: "Payment", body: "50% upfront to commence work, 50% on final delivery. Optional support retainer billed monthly after launch." },
    { clause_no: "03", title: "Client Obligations", body: "Client provides: brand assets, the placement/inventory catalog and pricing, and access to the hosting, domain, and Stripe accounts the system deploys to. Written feedback within 48 hours of each review milestone." },
    { clause_no: "04", title: "Ownership", body: "Full ownership of all code and deliverables transfers to the client on final payment. The system runs on the client's own infrastructure with no vendor lock-in." },
    { clause_no: "05", title: "Revisions", body: "Two rounds of revisions included per deliverable. Additional rounds billed hourly at an agreed rate." },
  ],
};

const { data, error } = await supabase
  .from("animated_proposals")
  .insert(payload)
  .select("id, slug, token, status, currency, total_price_cents")
  .single();

if (error) {
  console.error("INSERT ERROR:", error.message);
  process.exit(1);
}

const base = env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
console.log(JSON.stringify(data, null, 2));
console.log("PUBLIC_URL:", `${base}/proposal/${data.token}`);
console.log("created_by:", owner.email || owner.id);
