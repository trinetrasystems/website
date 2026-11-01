import { expect, test, type Page, type Request } from "@playwright/test";

// End-to-end: ticket chat on both sides + the emails it triggers.
//   customer message      → POST /api/notify/ticket-message (→ support@)
//   admin reply           → POST /api/notify/ticket-message (→ customer, copy support@)
//   admin status change   → POST /api/notify/ticket-status  (→ customer, copy support@)
// Firebase is the in-memory fake; /api calls are intercepted (no real email).

const ADMIN = { uid: "admin1", username: "yash-admin", email: "yash-admin@trinetra.local", password: "AdminPass1" };
const CUSTOMER = { uid: "cust1", username: "acme", email: "acme@trinetra.local", password: "Welcome@123" };

const ts = (iso: string) => ({ __ts: new Date(iso).getTime() });

const seedDocs = () => ({
  [`users/${ADMIN.uid}`]: { username: ADMIN.username, usernameKey: ADMIN.username, authEmail: ADMIN.email, role: "admin", isMember: false },
  [`loginIndex/${ADMIN.username}`]: { authEmail: ADMIN.email, userId: ADMIN.uid, username: ADMIN.username },
  [`loginIndex/${CUSTOMER.username}`]: { authEmail: CUSTOMER.email, userId: CUSTOMER.uid, username: CUSTOMER.username },
  [`users/${CUSTOMER.uid}`]: {
    username: CUSTOMER.username,
    usernameKey: CUSTOMER.username,
    authEmail: CUSTOMER.email,
    contactEmail: "owner@acme.example",
    role: "user",
    isMember: false,
    permissions: [],
    companyName: "Acme Foods",
    planType: "subscription",
    softwareValidUntil: ts("2027-04-30T23:59:59"),
  },
  // Existing website ticket: an old admin reply in the `replies` array + an
  // app-style message in the subcollection — both must show in one thread.
  "tickets/t1": {
    ticketNumber: "TKT-111111",
    userId: CUSTOMER.uid,
    userEmail: "owner@acme.example",
    userName: CUSTOMER.username,
    category: "Detection Not Working",
    title: "Camera 4 offline",
    description: "No feed since 9am",
    severity: "Medium",
    status: "Active",
    replies: [{ message: "Legacy reply: we are checking the NVR", role: "admin", timestamp: ts("2026-10-20T10:00:00") }],
    createdAt: ts("2026-10-20T09:00:00"),
    updatedAt: ts("2026-10-20T10:00:00"),
  },
  "tickets/t1/messages/m0": { from: "support", text: "Auto reply: ticket received", type: "text", createdAt: ts("2026-10-20T09:00:05") },
  // Existing mobile-app ticket: status words "open"/"done", username only.
  "tickets/app1": {
    id: "TKT-1007",
    title: "Gate camera blurry",
    category: "feature",
    severity: "Low",
    description: "Lens dirty?",
    status: "open",
    createdBy: CUSTOMER.username,
    site: "Pune HQ · Gate 01",
    createdAt: ts("2026-10-18T09:00:00"),
    updatedAt: ts("2026-10-18T09:00:00"),
  },
});

const seed = async (page: Page) => {
  await page.addInitScript(
    (value) => {
      if (sessionStorage.getItem("__seeded")) return;
      localStorage.setItem("__fakeFirebaseState", JSON.stringify({ docs: value.docs, accounts: value.accounts, session: null }));
      sessionStorage.setItem("__seeded", "1");
    },
    {
      docs: seedDocs(),
      accounts: [
        { uid: ADMIN.uid, email: ADMIN.email, password: ADMIN.password },
        { uid: CUSTOMER.uid, email: CUSTOMER.email, password: CUSTOMER.password },
      ],
    }
  );
};

type Call = { body: any; auth: string | null };
const mockApi = async (page: Page, path: string, reply: (call: Call) => { status?: number; body: unknown }) => {
  const calls: Call[] = [];
  await page.route(`**${path}`, async (route) => {
    const req: Request = route.request();
    const call = { body: req.postDataJSON(), auth: req.headers()["authorization"] ?? null };
    calls.push(call);
    const { status = 200, body } = reply(call);
    await route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
  });
  return calls;
};

const login = async (page: Page, who: { username: string; password: string }) => {
  // Sign out by clearing the fake session, keep all data.
  await page.evaluate(() => {
    const raw = localStorage.getItem("__fakeFirebaseState");
    if (!raw) return;
    const s = JSON.parse(raw);
    s.session = null;
    localStorage.setItem("__fakeFirebaseState", JSON.stringify(s));
  }).catch(() => undefined);
  await page.goto("/admin");
  await page.getByPlaceholder("Enter your username").fill(who.username);
  await page.getByPlaceholder("Enter your password").fill(who.password);
  await page.getByRole("button", { name: "Sign In" }).click();
};

const dump = (page: Page): Promise<Record<string, any>> => page.evaluate(() => window.__fakeFirebase.dump());
const messagesOf = (docs: Record<string, any>, ticketId: string) =>
  Object.entries(docs)
    .filter(([k]) => k.startsWith(`tickets/${ticketId}/messages/`))
    .map(([k, v]) => ({ id: k.split("/").pop()!, ...v }));

// ---------------------------------------------------------------------------

test("full conversation: customer ↔ admin chat, status change, unread badges and every email trigger", async ({ page }) => {
  await seed(page);
  const messageCalls = await mockApi(page, "/api/notify/ticket-message", (call) =>
    call.auth === `Bearer fake-id-token-${ADMIN.uid}` ? { body: { ok: true, to: "owner@acme.example" } } : { body: { ok: true } }
  );
  const statusCalls = await mockApi(page, "/api/notify/ticket-status", () => ({ body: { ok: true, to: "owner@acme.example" } }));
  await page.goto("/admin");

  // ---- Customer opens the ticket: old replies + app messages in one thread
  await login(page, CUSTOMER);
  await page.getByRole("button", { name: "Support Tickets" }).click();
  const ticket = page.getByTestId("user-ticket").filter({ hasText: "Camera 4 offline" });
  await ticket.getByRole("button", { name: /Open conversation/ }).click();
  const thread = ticket.getByTestId("ticket-thread");
  await expect(thread.getByTestId("ticket-message")).toHaveCount(2);
  await expect(thread.getByTestId("ticket-message").nth(0)).toContainText("Auto reply: ticket received");
  await expect(thread.getByTestId("ticket-message").nth(1)).toContainText("Legacy reply: we are checking the NVR");
  await expect(thread.getByTestId("ticket-message").nth(1)).toContainText("Trinetra Support");

  // ---- Customer sends a message (Enter sends)
  const box = ticket.getByLabel("Message to support");
  await box.fill("Still offline.\nPlease call me.");
  await box.press("Enter");
  await expect(page.getByText("Message sent to Trinetra Support")).toBeVisible();
  await expect(thread.getByTestId("ticket-message").last()).toContainText("Still offline.");
  await expect(thread.getByTestId("ticket-message").last()).toContainText("You");
  await expect(box).toHaveValue("");

  let docs = await dump(page);
  const userMsg = messagesOf(docs, "t1").find((m) => m.from === "user")!;
  expect(userMsg).toMatchObject({ from: "user", text: "Still offline.\nPlease call me.", type: "text", authorUid: CUSTOMER.uid, authorName: CUSTOMER.username });
  expect(docs["tickets/t1"]).toMatchObject({ lastMessageFrom: "user" });
  await expect.poll(() => messageCalls.length).toBe(1);
  expect(messageCalls[0]).toEqual({ body: { ticketId: "t1", messageId: userMsg.id }, auth: `Bearer fake-id-token-${CUSTOMER.uid}` });

  // ---- Admin: "Customer replied" badge, mobile ticket shown as Active
  await login(page, ADMIN);
  const adminTicket = page.getByTestId("admin-ticket").filter({ hasText: "Camera 4 offline" });
  await expect(adminTicket.getByTestId("ticket-unread")).toHaveText("Customer replied");
  const appTicket = page.getByTestId("admin-ticket").filter({ hasText: "Gate camera blurry" });
  await expect(appTicket).toContainText("Active");
  await expect(appTicket).toContainText("TKT-1007");

  await adminTicket.click();
  await expect(adminTicket.getByTestId("ticket-unread")).toHaveCount(0); // marked read
  const adminChat = page.getByTestId("ticket-chat");
  await expect(adminChat.getByTestId("ticket-message")).toHaveCount(3);
  await expect(adminChat.getByTestId("ticket-message").last()).toContainText("Still offline.");
  await expect(adminChat.getByTestId("ticket-message").last()).toContainText(CUSTOMER.username);

  // ---- Admin replies → customer email requested
  await adminChat.getByLabel("Reply to customer").fill("Technician visiting at 4 pm today.");
  await adminChat.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText("Reply sent and emailed to owner@acme.example")).toBeVisible();
  await expect(adminChat.getByTestId("ticket-message").last()).toContainText("Technician visiting at 4 pm today.");
  docs = await dump(page);
  const adminMsg = messagesOf(docs, "t1").find((m) => m.from === "support" && m.authorUid === ADMIN.uid)!;
  expect(adminMsg).toMatchObject({ text: "Technician visiting at 4 pm today.", authorName: "yash-admin" });
  expect(messageCalls[1]).toEqual({ body: { ticketId: "t1", messageId: adminMsg.id }, auth: `Bearer fake-id-token-${ADMIN.uid}` });

  // ---- Admin changes status → customer email requested; same status again = no-op
  await page.getByRole("button", { name: "Mark In Progress" }).click();
  await expect(page.getByText("Status set to In Progress — customer emailed at owner@acme.example")).toBeVisible();
  expect(statusCalls).toEqual([{ body: { ticketId: "t1" }, auth: `Bearer fake-id-token-${ADMIN.uid}` }]);
  expect((await dump(page))["tickets/t1"].status).toBe("In Progress");
  await page.getByRole("button", { name: "Mark In Progress" }).click();
  await page.waitForTimeout(300);
  expect(statusCalls).toHaveLength(1);

  // ---- Customer sees the reply, new status and a "New reply" badge
  await login(page, CUSTOMER);
  await page.getByRole("button", { name: "Support Tickets" }).click();
  const again = page.getByTestId("user-ticket").filter({ hasText: "Camera 4 offline" });
  await expect(again.getByTestId("ticket-unread")).toHaveText("New reply");
  await expect(again).toContainText("In Progress");
  await again.getByRole("button", { name: /Open conversation/ }).click();
  await expect(again.getByTestId("ticket-unread")).toHaveCount(0);
  await expect(again.getByTestId("ticket-message").last()).toContainText("Technician visiting at 4 pm today.");
  await expect(again.getByTestId("ticket-message").last()).toContainText("Trinetra Support");
});

test("chat is live: a support reply appears in the customer's open conversation without reloading", async ({ page }) => {
  await seed(page);
  await mockApi(page, "/api/notify/ticket-message", () => ({ body: { ok: true } }));
  await page.goto("/admin");
  await login(page, CUSTOMER);
  await page.getByRole("button", { name: "Support Tickets" }).click();
  const ticket = page.getByTestId("user-ticket").filter({ hasText: "Camera 4 offline" });
  await ticket.getByRole("button", { name: /Open conversation/ }).click();
  await expect(ticket.getByTestId("ticket-message")).toHaveCount(2);

  await page.evaluate((at) => {
    window.__fakeFirebase.setDoc("tickets/t1/messages/live1", { from: "support", text: "Live: fixed remotely", type: "text", createdAt: { __ts: at } });
  }, Date.now());
  await expect(ticket.getByTestId("ticket-message")).toHaveCount(3);
  await expect(ticket.getByTestId("ticket-message").last()).toContainText("Live: fixed remotely");
});

test("email failures never lose a message or a status change", async ({ page }) => {
  await seed(page);
  await mockApi(page, "/api/notify/ticket-message", () => ({ status: 500, body: { error: "SMTP down" } }));
  await mockApi(page, "/api/notify/ticket-status", () => ({ status: 500, body: { error: "SMTP down" } }));
  await page.goto("/admin");
  await login(page, ADMIN);
  const adminTicket = page.getByTestId("admin-ticket").filter({ hasText: "Camera 4 offline" });
  await adminTicket.click();
  const chat = page.getByTestId("ticket-chat");
  await chat.getByLabel("Reply to customer").fill("Reply despite SMTP outage");
  await chat.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText("Reply sent, but the email to the customer failed: SMTP down")).toBeVisible();
  await expect(chat.getByTestId("ticket-message").last()).toContainText("Reply despite SMTP outage");

  await page.getByRole("button", { name: "Mark Solved" }).click();
  await expect(page.getByText("Status set to Solved, but the email to the customer failed: SMTP down")).toBeVisible();
  const docs = await dump(page);
  expect(docs["tickets/t1"].status).toBe("Solved");
  expect(messagesOf(docs, "t1").some((m) => m.text === "Reply despite SMTP outage")).toBe(true);
});

test("customer with no registered email: admin is told no email was sent", async ({ page }) => {
  await seed(page);
  await mockApi(page, "/api/notify/ticket-status", () => ({ body: { ok: true, skipped: true, reason: "no-email" } }));
  await page.goto("/admin");
  await login(page, ADMIN);
  await page.getByTestId("admin-ticket").filter({ hasText: "Gate camera blurry" }).click();
  await page.getByRole("button", { name: "Mark Solved" }).click();
  await expect(page.getByText("Status set to Solved. This customer has no registered email, so no email was sent.")).toBeVisible();
  expect((await dump(page))["tickets/app1"].status).toBe("Solved");
});
