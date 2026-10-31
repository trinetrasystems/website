import { expect, test, type Page, type Request } from "@playwright/test";

// End-to-end: admin creates / edits customers with company, cameras, Jetsons,
// plan, validity, pricing and notes; the welcome email is requested; the
// customer sees validity but never pricing; tickets and one-time feedback
// trigger their support@ emails.

const ADMIN = { uid: "admin1", username: "yash-admin", email: "yash-admin@trinetra.local", password: "AdminPass1" };
const CUSTOMER = { uid: "cust1", username: "acme", email: "acme@trinetra.local", password: "Welcome@123" };

const ts = (iso: string) => ({ __ts: new Date(iso).getTime() });

type Seed = { docs: Record<string, unknown>; accounts: { uid: string; email: string; password: string }[] };

const baseSeed = (): Seed => ({
  accounts: [
    { uid: ADMIN.uid, email: ADMIN.email, password: ADMIN.password },
    { uid: CUSTOMER.uid, email: CUSTOMER.email, password: CUSTOMER.password },
  ],
  docs: {
    [`users/${ADMIN.uid}`]: { username: ADMIN.username, usernameKey: ADMIN.username, authEmail: ADMIN.email, role: "admin", isMember: false },
    [`loginIndex/${ADMIN.username}`]: { authEmail: ADMIN.email, userId: ADMIN.uid, username: ADMIN.username },
    [`loginIndex/${CUSTOMER.username}`]: { authEmail: CUSTOMER.email, userId: CUSTOMER.uid, username: CUSTOMER.username },
    [`users/${CUSTOMER.uid}`]: {
      username: CUSTOMER.username,
      usernameKey: CUSTOMER.username,
      authEmail: CUSTOMER.email,
      contactEmail: "owner@acme.example",
      contactMobile: "9876543210",
      role: "user",
      isMember: false,
      permissions: [],
      ip_link: "10.0.0.5:8080",
      companyName: "Acme Foods",
      cameraCount: 16,
      planType: "subscription",
      softwareLifetime: false,
      softwareValidFrom: ts("2026-11-01T00:00:00"),
      softwareValidUntil: ts("2027-04-30T23:59:59.999"),
      softwareValidityValue: 6,
      softwareValidityUnit: "months",
      maintenanceLifetime: false,
      maintenanceValidFrom: null,
      maintenanceValidUntil: null,
      maintenanceValidityValue: 0,
      maintenanceValidityUnit: "",
    },
    [`userPasswords/${CUSTOMER.uid}`]: { uid: CUSTOMER.uid, username: CUSTOMER.username, password: CUSTOMER.password },
    [`userBilling/${CUSTOMER.uid}`]: { planCost: 120000, amountPaid: 50000, maintenanceCost: null, depositAmount: 20000, depositRefunded: false, jetsonCount: 2, notes: "SECRET-NOTE gate cams" },
  },
});

/** Seed fake Firebase once per tab (reloads keep the state). */
const seed = async (page: Page, s: Seed = baseSeed()) => {
  await page.addInitScript((value) => {
    if (sessionStorage.getItem("__seeded")) return;
    localStorage.setItem("__fakeFirebaseState", JSON.stringify({ docs: value.docs, accounts: value.accounts, session: null }));
    sessionStorage.setItem("__seeded", "1");
  }, s);
};

/** Intercept an /api endpoint, record calls, answer with the given status/body. */
const mockApi = async (page: Page, path: string, status = 200, body: unknown = { ok: true }) => {
  const calls: { body: any; auth: string | null }[] = [];
  await page.route(`**${path}`, async (route) => {
    const req: Request = route.request();
    calls.push({ body: req.postDataJSON(), auth: req.headers()["authorization"] ?? null });
    await route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
  });
  return calls;
};

const login = async (page: Page, username: string, password: string) => {
  await page.goto("/admin");
  await page.getByPlaceholder("Enter your username").fill(username);
  await page.getByPlaceholder("Enter your password").fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
};

const dump = (page: Page) => page.evaluate(() => window.__fakeFirebase.dump());

const findUserByUsername = (docs: Record<string, any>, username: string) => {
  const entry = Object.entries(docs).find(([k, v]) => k.startsWith("users/") && v.username === username);
  return entry ? { uid: entry[0].slice("users/".length), data: entry[1] } : null;
};

const toLocalDate = (ms: number) => {
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// ---------------------------------------------------------------------------

test("admin creates a subscription customer with all new fields; welcome email is requested", async ({ page }) => {
  await seed(page);
  const welcomeCalls = await mockApi(page, "/api/notify/welcome");
  await login(page, ADMIN.username, ADMIN.password);
  await page.getByRole("button", { name: "Create User", exact: true }).click();

  const form = page.locator("form").filter({ has: page.getByPlaceholder("New username") });
  await form.getByPlaceholder("New username").fill("delta");
  await form.getByPlaceholder("New user password").fill("Delta@2026");
  await form.getByPlaceholder("User's real email").fill("it@delta.example");
  await form.getByPlaceholder("User's mobile number").fill("9000000001");

  await page.locator("#create-company").fill("Delta Logistics");
  await page.locator("#create-cameras").fill("24");
  await page.locator("#create-jetsons").fill("3");

  // Subscription is the default. 6 months starting 1 Nov 2026 → ends 30 Apr 2027.
  await expect(page.getByRole("radio", { name: /Subscription/ })).toBeChecked();
  await page.locator("#create-cycle").fill("6");
  await page.getByLabel("Subscription duration unit").selectOption("months");
  await page.locator("#create-start").fill("2026-11-01");
  await expect(page.locator("#create-end")).toHaveValue("2027-04-30");

  await page.locator("#create-cost").fill("90000");
  await page.locator("#create-paid").fill("30000");
  await expect(page.getByTestId("create-balance")).toHaveText("₹60,000");
  await expect(page.locator("#create-deposit-refunded")).toBeDisabled(); // nothing to refund yet
  await page.locator("#create-deposit").fill("15000");
  // The deposit is separate from the plan cost: balance is unchanged.
  await expect(page.getByTestId("create-balance")).toHaveText("₹60,000");
  await page.locator("#create-notes").fill("PRIVATE: install at dock 4");

  await form.getByRole("button", { name: "Create User" }).click();
  await expect(page.getByText("Welcome email sent to it@delta.example")).toBeVisible();

  const docs = await dump(page);
  const created = findUserByUsername(docs, "delta")!;
  expect(created).not.toBeNull();
  // Customer-readable user doc: plan + validity, no money / Jetsons / notes.
  expect(created.data).toMatchObject({
    companyName: "Delta Logistics",
    cameraCount: 24,
    planType: "subscription",
    softwareLifetime: false,
    softwareValidityValue: 6,
    softwareValidityUnit: "months",
    contactEmail: "it@delta.example",
    role: "user",
  });
  expect(toLocalDate(created.data.softwareValidFrom.__ts)).toBe("2026-11-01");
  expect(toLocalDate(created.data.softwareValidUntil.__ts)).toBe("2027-04-30");
  for (const k of ["planCost", "amountPaid", "jetsonCount", "notes", "maintenanceCost", "depositAmount", "depositRefunded"]) {
    expect(created.data).not.toHaveProperty(k);
  }
  // Admin-only billing doc.
  expect(docs[`userBilling/${created.uid}`]).toMatchObject({
    planCost: 90000,
    amountPaid: 30000,
    jetsonCount: 3,
    depositAmount: 15000,
    depositRefunded: false,
    notes: "PRIVATE: install at dock 4",
    updatedByUid: ADMIN.uid,
  });
  // Welcome email requested for the new uid with the admin's token.
  expect(welcomeCalls).toEqual([{ body: { uid: created.uid, resend: false }, auth: `Bearer fake-id-token-${ADMIN.uid}` }]);
  // Form reset after success.
  await expect(page.locator("#create-company")).toHaveValue("");
});

test("create user validation blocks bad plan input and creates nothing", async ({ page }) => {
  await seed(page);
  const welcomeCalls = await mockApi(page, "/api/notify/welcome");
  await login(page, ADMIN.username, ADMIN.password);
  await page.getByRole("button", { name: "Create User", exact: true }).click();
  const form = page.locator("form").filter({ has: page.getByPlaceholder("New username") });
  await form.getByPlaceholder("New username").fill("bad");
  await form.getByPlaceholder("New user password").fill("Bad@12345");
  await form.getByPlaceholder("User's real email").fill("bad@x.example");
  await form.getByPlaceholder("User's mobile number").fill("9000000002");

  await form.getByRole("button", { name: "Create User" }).click();
  await expect(page.getByText("Company name is required.").first()).toBeVisible();

  await page.locator("#create-company").fill("Bad Co");
  await page.locator("#create-cost").fill("1000");
  await page.locator("#create-paid").fill("5000");
  await expect(page.getByTestId("create-balance")).toHaveText("Received exceeds cost");
  await form.getByRole("button", { name: "Create User" }).click();
  await expect(page.getByText("Amount received cannot be more than the plan cost.").first()).toBeVisible();

  await page.locator("#create-paid").fill("500");
  await page.locator("#create-end").fill("2020-01-01");
  await form.getByRole("button", { name: "Create User" }).click();
  // The date input's min= makes the browser itself refuse the submit
  // (validatePlanForm repeats the check in JS — covered by unit tests).
  expect(await page.locator("#create-end").evaluate((el: HTMLInputElement) => el.validity.rangeUnderflow)).toBe(true);
  await expect(page.getByText("User created successfully")).toHaveCount(0);

  expect(findUserByUsername(await dump(page), "bad")).toBeNull();
  expect(welcomeCalls).toHaveLength(0);
});

test("welcome email failure does not block user creation", async ({ page }) => {
  await seed(page);
  await mockApi(page, "/api/notify/welcome", 503, { error: "Email service is not configured: SMTP_HOST / SMTP_USER / SMTP_PASS missing." });
  await login(page, ADMIN.username, ADMIN.password);
  await page.getByRole("button", { name: "Create User", exact: true }).click();
  const form = page.locator("form").filter({ has: page.getByPlaceholder("New username") });
  await form.getByPlaceholder("New username").fill("echo");
  await form.getByPlaceholder("New user password").fill("Echo@12345");
  await form.getByPlaceholder("User's real email").fill("echo@x.example");
  await form.getByPlaceholder("User's mobile number").fill("9000000003");
  await page.locator("#create-company").fill("Echo Ltd");
  await form.getByRole("button", { name: "Create User" }).click();
  await expect(page.getByText(/User created, but the welcome email could not be sent/)).toBeVisible();
  expect(findUserByUsername(await dump(page), "echo")).not.toBeNull();
});

test("admin edits a customer: billing prefilled, switch to lifetime + maintenance, resend welcome", async ({ page }) => {
  await seed(page);
  const welcomeCalls = await mockApi(page, "/api/notify/welcome");
  await login(page, ADMIN.username, ADMIN.password);
  await page.getByRole("button", { name: "Edit User", exact: true }).click();

  // List shows company + validity chip; search by company works.
  await page.getByPlaceholder(/Search by username, company/).fill("acme foods");
  const item = page.getByRole("button", { name: /acme/ }).filter({ hasText: "Acme Foods" });
  await expect(item).toContainText("Plan till 30 Apr 2027");
  await item.click();

  // Plan + billing prefilled from users/{uid} and userBilling/{uid}.
  await expect(page.locator("#edit-company")).toHaveValue("Acme Foods");
  await expect(page.locator("#edit-cameras")).toHaveValue("16");
  await expect(page.locator("#edit-jetsons")).toHaveValue("2");
  await expect(page.locator("#edit-cycle")).toHaveValue("6");
  await expect(page.locator("#edit-start")).toHaveValue("2026-11-01");
  await expect(page.locator("#edit-end")).toHaveValue("2027-04-30");
  await expect(page.locator("#edit-cost")).toHaveValue("120000");
  await expect(page.locator("#edit-paid")).toHaveValue("50000");
  await expect(page.getByTestId("edit-balance")).toHaveText("₹70,000");
  await expect(page.locator("#edit-notes")).toHaveValue("SECRET-NOTE gate cams");
  await expect(page.locator("#edit-deposit")).toHaveValue("20000");
  await expect(page.locator("#edit-deposit-refunded")).not.toBeChecked();

  // Convert to a lifetime solution with yearly maintenance.
  await page.getByRole("radio", { name: /Lifetime Solution/ }).check();
  await expect(page.locator("label[for='edit-cycle']")).toHaveText("Maintenance Every");
  await page.locator("#edit-cycle").fill("1");
  await page.getByLabel("Maintenance duration unit").selectOption("years");
  await page.locator("#edit-start").fill("2026-12-01");
  await expect(page.locator("#edit-end")).toHaveValue("2027-11-30");
  await page.locator("#edit-cost").fill("300000");
  await page.locator("#edit-paid").fill("300000");
  await expect(page.getByTestId("edit-balance")).toHaveText("Fully paid");
  await page.locator("#edit-maint-cost").fill("15000");
  await page.locator("#edit-jetsons").fill("4");
  await page.locator("#edit-notes").fill("Converted to lifetime in Dec");
  await page.locator("#edit-deposit-refunded").check();
  await expect(page.getByText("Refunded to customer")).toBeVisible();

  await page.getByRole("button", { name: "Save Changes" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("User updated successfully").first()).toBeVisible();

  const docs = await dump(page);
  const user = docs[`users/${CUSTOMER.uid}`];
  expect(user).toMatchObject({
    planType: "lifetime",
    softwareLifetime: true,
    softwareValidUntil: null,
    maintenanceValidityValue: 1,
    maintenanceValidityUnit: "years",
    companyName: "Acme Foods",
  });
  expect(toLocalDate(user.maintenanceValidFrom.__ts)).toBe("2026-12-01");
  expect(toLocalDate(user.maintenanceValidUntil.__ts)).toBe("2027-11-30");
  for (const k of ["planCost", "amountPaid", "jetsonCount", "notes"]) expect(user).not.toHaveProperty(k);
  expect(docs[`userBilling/${CUSTOMER.uid}`]).toMatchObject({
    planCost: 300000,
    amountPaid: 300000,
    maintenanceCost: 15000,
    depositAmount: 20000,
    depositRefunded: true,
    jetsonCount: 4,
    notes: "Converted to lifetime in Dec",
  });

  // Resend welcome email.
  await page.getByRole("button", { name: /Send Welcome Email|Resend Welcome Email/ }).click();
  await expect(page.getByText("Welcome email sent to owner@acme.example")).toBeVisible();
  expect(welcomeCalls).toEqual([{ body: { uid: CUSTOMER.uid, resend: true }, auth: `Bearer fake-id-token-${ADMIN.uid}` }]);
});

test("customer dashboard shows plan & validity but never pricing, Jetsons or notes", async ({ page }) => {
  await seed(page);
  await login(page, CUSTOMER.username, CUSTOMER.password);
  await expect(page.getByRole("heading", { name: "Acme" })).toBeVisible();
  await expect(page.getByTestId("user-company")).toHaveText("Acme Foods");
  const summary = page.getByTestId("user-plan-summary");
  await expect(summary).toContainText("Subscription");
  await expect(summary).toContainText("Cameras16");
  await expect(summary).toContainText("1 Nov 2026");
  await expect(summary).toContainText("30 Apr 2027");
  const validity = page.getByTestId("user-validity");
  await expect(validity).toContainText("Subscription validity");
  await expect(validity).toContainText("Valid 1 November 2026 → 30 April 2027");
  await expect(validity).toContainText("Renews every 6 months");

  const text = await page.locator("body").innerText();
  expect(text).not.toMatch(/120000|1,20,000|50000|70,000|20000|20,000|₹|Jetson|SECRET-NOTE|Plan Cost|Balance|deposit/i);

  // Even a direct read of the billing doc from the customer session is refused.
  const denied = await page.evaluate(async () => {
    const fs = await import("/e2e/fake-firebase/firestore.ts");
    try {
      await fs.getDoc(fs.doc(fs.getFirestore(), "userBilling", "cust1"));
      return "allowed";
    } catch (e: any) {
      return e.code;
    }
  });
  expect(denied).toBe("permission-denied");
});

test("lifetime customer sees licence + maintenance validity", async ({ page }) => {
  const s = baseSeed();
  Object.assign(s.docs[`users/${CUSTOMER.uid}`] as object, {
    planType: "lifetime",
    softwareLifetime: true,
    softwareValidFrom: null,
    softwareValidUntil: null,
    softwareValidityValue: 0,
    softwareValidityUnit: "lifetime",
    maintenanceValidFrom: ts("2026-12-01T00:00:00"),
    maintenanceValidUntil: ts("2027-11-30T23:59:59.999"),
    maintenanceValidityValue: 1,
    maintenanceValidityUnit: "years",
  });
  await seed(page, s);
  await login(page, CUSTOMER.username, CUSTOMER.password);
  await expect(page.getByTestId("user-plan-summary")).toContainText("Lifetime Solution");
  const validity = page.getByTestId("user-validity");
  await expect(validity).toContainText("Software licence never expires");
  await expect(validity).toContainText("Maintenance validity");
  await expect(validity).toContainText("Valid 1 December 2026 → 30 November 2027");
  await expect(validity).toContainText("Renews every year");
});

test("raising a ticket notifies support@ via the API with the new ticket id", async ({ page }) => {
  await seed(page);
  const ticketCalls = await mockApi(page, "/api/notify/ticket");
  await login(page, CUSTOMER.username, CUSTOMER.password);
  await page.getByRole("button", { name: "Support Tickets" }).click();
  await page.getByRole("button", { name: /new ticket|create ticket|raise/i }).first().click();
  await page.getByPlaceholder("Brief summary of the issue").fill("Camera 4 offline");
  await page.getByPlaceholder("Provide detailed information about your issue...").fill("No feed since 9am");
  await page.getByRole("button", { name: "Submit Ticket" }).click();

  const toast = page.getByText(/Your support ticket has been created with Ticket ID: TKT-\d{6}\./);
  await expect(toast).toBeVisible();
  await expect.poll(() => ticketCalls.length).toBe(1);

  const docs = await dump(page);
  const [ticketPath, ticket] = Object.entries(docs).find(([k]) => k.startsWith("tickets/"))! as [string, any];
  expect(ticketCalls[0]).toEqual({ body: { ticketId: ticketPath.slice("tickets/".length) }, auth: null });
  expect(ticket).toMatchObject({ title: "Camera 4 offline", userId: CUSTOMER.uid, status: "Active" });
  expect(await toast.innerText()).toContain(ticket.ticketNumber);
});

test("feedback can be submitted once and is forwarded to support@", async ({ page }) => {
  await seed(page);
  const feedbackCalls = await mockApi(page, "/api/notify/feedback");
  await login(page, CUSTOMER.username, CUSTOMER.password);
  await page.getByRole("button", { name: "Feedback" }).click();
  const form = page.getByTestId("feedback-form");
  await expect(form).toBeVisible();

  await form.getByRole("button", { name: "Submit Feedback" }).click();
  await expect(page.getByText("Please choose a rating.")).toBeVisible();

  await form.getByRole("radio", { name: "4 stars" }).click();
  await form.getByLabel("Your feedback").fill("Alerts are fast and accurate.");
  await form.getByRole("button", { name: "Submit Feedback" }).click();

  await expect(page.getByTestId("feedback-thanks")).toBeVisible();
  await expect(page.getByTestId("feedback-thanks")).toContainText("Alerts are fast and accurate.");
  await expect.poll(() => feedbackCalls.length).toBe(1);
  expect(feedbackCalls[0].auth).toBe(`Bearer fake-id-token-${CUSTOMER.uid}`);

  const docs = await dump(page);
  expect(docs[`feedback/${CUSTOMER.uid}`]).toMatchObject({ rating: 4, message: "Alerts are fast and accurate.", companyName: "Acme Foods", username: "acme" });

  // After a reload the form is gone — feedback is one-time.
  await page.reload();
  await page.getByRole("button", { name: "Feedback" }).click();
  await expect(page.getByTestId("feedback-thanks")).toBeVisible();
  await expect(page.getByTestId("feedback-form")).toHaveCount(0);

  // And a second write is refused (mirrors the create-only rule).
  const second = await page.evaluate(async () => {
    const fs = await import("/e2e/fake-firebase/firestore.ts");
    try {
      await fs.setDoc(fs.doc(fs.getFirestore(), "feedback", "cust1"), { rating: 1, message: "changed", createdAt: fs.serverTimestamp() });
      return "allowed";
    } catch (e: any) {
      return e.code;
    }
  });
  expect(second).toBe("permission-denied");
  expect(feedbackCalls).toHaveLength(1);
});

test("legacy customer created before plans existed still opens in Edit User and dashboard", async ({ page }) => {
  const s = baseSeed();
  s.docs[`users/${CUSTOMER.uid}`] = {
    username: CUSTOMER.username,
    authEmail: CUSTOMER.email,
    contactEmail: "owner@acme.example",
    contactMobile: "9876543210",
    role: "user",
    ip_link: "",
    validUntil: ts("2027-01-15T12:00:00"),
    softwareValidityValue: 1,
    softwareValidityUnit: "years",
  };
  delete s.docs[`userBilling/${CUSTOMER.uid}`];
  await seed(page, s);
  await login(page, ADMIN.username, ADMIN.password);
  await page.getByRole("button", { name: "Edit User", exact: true }).click();
  await page.getByRole("button", { name: /acme/ }).first().click();
  await expect(page.locator("#edit-end")).toHaveValue("2027-01-15");
  await expect(page.locator("#edit-company")).toHaveValue("");
  await expect(page.locator("#edit-cost")).toHaveValue("");
  // Saving without a company name is blocked with a clear message.
  await page.getByRole("button", { name: "Save Changes" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Company name is required.").first()).toBeVisible();
});
