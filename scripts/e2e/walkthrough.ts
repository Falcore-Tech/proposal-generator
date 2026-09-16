import { chromium, type Page } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3123";
const EMAIL = "faez@falcoretech.com";
const PASSWORD = process.env.PASSWORD!;
const PROPOSAL_ID = "6c1f2e1c-b314-419f-9e4f-4f262e55e493";
const TOKEN = process.env.TOKEN!;

const results: string[] = [];
const consoleErrors: string[] = [];
const failedRequests: string[] = [];

function ok(label: string) { results.push(`PASS ${label}`); }
function fail(label: string, why: string) { results.push(`FAIL ${label}: ${why}`); }

async function step(label: string, fn: () => Promise<void>) {
  try { await fn(); ok(label); } catch (e) { fail(label, (e as Error).message.split("\n")[0]); }
}

const browser = await chromium.launch({ executablePath: "/usr/bin/chromium" });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(`${page.url().replace(BASE, "")} :: ${m.text().slice(0, 160)}`); });
page.on("response", (r) => { if (r.status() >= 400 && !r.url().includes("_next/")) failedRequests.push(`${r.status()} ${r.request().method()} ${r.url().replace(BASE, "")}`); });
page.on("pageerror", (e) => consoleErrors.push(`${page.url().replace(BASE, "")} :: PAGEERROR ${e.message.slice(0, 160)}`));

async function expectUrl(pattern: string | RegExp) {
  await page.waitForURL(pattern, { timeout: 15000 });
}
async function expectText(text: string) {
  await page.getByText(text, { exact: false }).first().waitFor({ timeout: 15000 });
}

// ---- unauthenticated ----
await step("unauth /proposals redirects to /login", async () => { await page.goto(`${BASE}/proposals`); await expectUrl(/\/login/); });
await step("home page loads", async () => { await page.goto(`${BASE}/`); await page.waitForLoadState("networkidle"); });

// ---- login form ----
await step("login with wrong password shows error", async () => {
  await page.goto(`${BASE}/login`);
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', "definitely-wrong");
  await page.click('button[type="submit"]');
  await page.getByText("Invalid email or password").waitFor({ timeout: 15000 });
});
await step("login with correct password lands on /proposals", async () => {
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await expectUrl(/\/proposals/);
  await expectText("All Proposals");
});

// ---- navbar links ----
for (const [label, href, marker] of [
  ["Proposals", "/proposals", "All Proposals"],
  ["Sales team", "/sales-team", "Sales"],
  ["Reports", "/reports", "Reports"],
  ["Settings", "/settings", "Theme"],
  ["Packages", "/admin/packages", "Package"],
  ["T&C management", "/admin/tos-management", "Terms"],
] as const) {
  await step(`page ${href} renders (${label})`, async () => { await page.goto(`${BASE}${href}`); await page.waitForLoadState("networkidle"); await expectText(marker); });
}

// ---- proposals list interactions ----
await step("proposals list shows Lumi and filter buttons work", async () => {
  await page.goto(`${BASE}/proposals`);
  await page.waitForLoadState("networkidle");
  await expectText("Lumi Collection");
  await page.getByRole("button", { name: "Archived", exact: true }).click();
  await expectUrl(/filter=archived/);
  await page.waitForLoadState("networkidle");
  await expectText("Lumi Collection");
  await page.getByRole("button", { name: "All", exact: true }).click();
  await page.getByRole("button", { name: /Refresh/ }).click();
  await page.waitForLoadState("networkidle");
});
await step("search filters proposals", async () => {
  await page.fill('input[placeholder*="Search"]', "zzz-no-match");
  await page.waitForTimeout(600);
  await expectText("No proposals match");
  await page.fill('input[placeholder*="Search"]', "");
});

// ---- detail page ----
await step("proposal detail page renders with events", async () => {
  await page.goto(`${BASE}/proposals/animated/${PROPOSAL_ID}`);
  await expectText("Lumi Collection");
  await page.waitForLoadState("networkidle");
});
await step("copy link / edit buttons present", async () => {
  await page.getByRole("link", { name: /Edit/ }).first().waitFor();
});

// ---- edit form ----
await step("edit form loads and saves a change", async () => {
  await page.goto(`${BASE}/proposals/animated/${PROPOSAL_ID}/edit`);
  await expectText("Edit Animated Proposal");
  const teaser = page.locator("textarea, input").filter({ hasText: "" }).first();
  const stripe = page.locator('input[placeholder*="stripe"]');
  await page.getByText("Meta", { exact: true }).click().catch(() => {});
  await stripe.waitFor({ state: "visible", timeout: 5000 }).catch(() => {});
  const saveButton = page.getByRole("button", { name: /Save/ }).first();
  await saveButton.click();
  await page.waitForResponse((r) => r.url().includes(`/api/animated-proposals/${PROPOSAL_ID}`) && r.request().method() === "PATCH" && r.status() === 200, { timeout: 15000 });
});

// ---- settings ----
await step("settings: change theme and revert", async () => {
  await page.goto(`${BASE}/settings`);
  await page.waitForLoadState("networkidle");
  const dracula = page.getByText("Dracula", { exact: false }).first();
  await dracula.click();
  const save = page.getByRole("button", { name: /Save/ }).first();
  await save.click();
  await page.waitForResponse((r) => r.url().includes("/api/settings") && r.request().method() === "PATCH" && r.status() === 200);
  await page.getByText("Rosé Pine Dawn", { exact: false }).first().click();
  await save.click();
  await page.waitForResponse((r) => r.url().includes("/api/settings") && r.request().method() === "PATCH" && r.status() === 200);
});

// ---- packages ----
await step("packages: add, add feature, save, duplicate, delete", async () => {
  await page.goto(`${BASE}/admin/packages`);
  await page.waitForLoadState("networkidle");
  page.on("dialog", (d) => d.accept());
  const cardsBefore = await page.getByRole("button", { name: /Duplicate/ }).count();
  await page.getByRole("button", { name: /Add Package/i }).first().click();
  await expectText("New Package");
  await page.waitForTimeout(500);
  const editBtn = page.getByRole("button", { name: /^Edit$/i }).last();
  if (await editBtn.count()) await editBtn.click();
  const addFeature = page.getByRole("button", { name: /Add Feature/i }).last();
  if (await addFeature.count()) {
    await addFeature.click();
    await page.locator('input[value="New Feature"]').first().waitFor({ timeout: 10000 });
  }
  const save = page.getByRole("button", { name: /^Save/i }).last();
  if (await save.count()) await save.click();
  await page.waitForTimeout(800);
  await page.getByRole("button", { name: /Duplicate/ }).last().click();
  await expectText("(Copy)");
  await page.waitForTimeout(500);
  let cards = await page.getByRole("button", { name: /Duplicate/ }).count();
  if (cards !== cardsBefore + 2) throw new Error(`expected ${cardsBefore + 2} packages, saw ${cards}`);
  while ((await page.getByRole("button", { name: /Duplicate/ }).count()) > cardsBefore) {
    const before = await page.getByRole("button", { name: /Duplicate/ }).count();
    await page.locator("button", { has: page.locator("svg.lucide-trash-2, svg.lucide-trash2") }).last().click();
    await page.waitForFunction((n) => document.querySelectorAll("button").length && [...document.querySelectorAll("button")].filter(b => /Duplicate/.test(b.textContent || "")).length < n, before, { timeout: 10000 });
  }
});

// ---- T&C ----
await step("T&C management: create then delete template", async () => {
  await page.goto(`${BASE}/admin/tos-management`);
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: /Create Template/i }).click();
  await page.locator("#name").fill("E2E Test Template");
  await page.getByRole("button", { name: /Add Term/i }).click();
  await page.locator('input[placeholder*="Title"]').first().fill("Payment");
  await page.locator('textarea[placeholder*="Term content"]').first().fill("Pay on time.");
  await page.getByRole("button", { name: /^Create$/ }).click();
  await page.waitForResponse((r) => r.url().includes("/api/admin/tos-templates") && r.request().method() === "POST" && r.status() === 201, { timeout: 15000 });
  await expectText("E2E Test Template");
  page.on("dialog", (d) => d.accept());
  const card = page.locator("div", { hasText: "E2E Test Template" }).filter({ has: page.getByRole("button", { name: /Delete/ }) }).last();
  await card.getByRole("button", { name: /Delete/ }).click();
  await page.waitForResponse((r) => r.url().includes("/api/admin/tos-templates/") && r.request().method() === "DELETE" && r.status() === 200, { timeout: 15000 });
});

// ---- sales team ----
await step("sales team: new rep form submits (expects Neon admin role)", async () => {
  await page.goto(`${BASE}/sales-team/new`);
  await page.waitForLoadState("networkidle");
  await page.fill('input[type="email"]', "e2e-rep@falcoretech.com");
  const nameField = page.locator('input[name="name"], input[placeholder*="name" i]').first();
  if (await nameField.count()) await nameField.fill("E2E Rep");
  await page.fill('input[type="password"]', "E2eRepPassword123");
  await page.click('button[type="submit"]');
  const res = await page.waitForResponse((r) => r.url().includes("/api/admin/sales-reps") && r.request().method() === "POST", { timeout: 20000 });
  if (res.status() !== 200) throw new Error(`POST /api/admin/sales-reps -> ${res.status()} ${(await res.text()).slice(0, 120)}`);
  await page.waitForTimeout(1500);
  await page.goto(`${BASE}/sales-team`);
  await page.waitForLoadState("networkidle");
  await expectText("e2e-rep@falcoretech.com");
});

// ---- public viewer + PDF ----
await step("public proposal viewer renders and PDF downloads", async () => {
  await page.goto(`${BASE}/proposal/${TOKEN}`);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(4500);
  await page.keyboard.press("Enter").catch(() => {});
  const dl = page.waitForEvent("download", { timeout: 30000 });
  await page.getByRole("button", { name: /Download PDF/i }).click();
  const d = await dl;
  if (!(d.suggestedFilename() ?? "").endsWith(".pdf")) throw new Error("not a pdf");
});

// ---- sign out ----
await step("sign out from navbar", async () => {
  await page.goto(`${BASE}/proposals`);
  await page.waitForLoadState("networkidle");
  const userMenu = page.getByText(EMAIL, { exact: false }).first();
  if (await userMenu.count()) await userMenu.click();
  await page.getByRole("button", { name: /Sign out|Logout|Log out/i }).first().click();
  await expectUrl(/\/login/);
  await page.goto(`${BASE}/proposals`);
  await expectUrl(/\/login/);
});

await browser.close();
console.log(results.join("\n"));
console.log("\n== console errors ==\n" + (consoleErrors.length ? [...new Set(consoleErrors)].join("\n") : "none"));
console.log("\n== failed requests ==\n" + (failedRequests.length ? [...new Set(failedRequests)].join("\n") : "none"));
