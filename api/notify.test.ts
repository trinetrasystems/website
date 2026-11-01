// @vitest-environment node
//
// Integration tests for the email endpoints: real HTTP requests into the
// handlers, real nodemailer → a real local SMTP server, with Firestore and
// token verification replaced by an in-memory fake.

import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { SMTPServer } from "smtp-server";
import { simpleParser, type ParsedMail } from "mailparser";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

// ---------------- in-memory Firestore + auth ----------------

const ts = (date: Date) => ({ toDate: () => date });
type DocData = Record<string, any>;
const store = new Map<string, DocData>();
const key = (col: string, id: string) => `${col}/${id}`;
const isPlainObject = (v: unknown) => !!v && typeof v === "object" && !(v instanceof Date) && !("toDate" in (v as object)) && !Array.isArray(v);
const deepMerge = (a: DocData, b: DocData): DocData => {
  const out: DocData = { ...a };
  for (const [k, v] of Object.entries(b)) out[k] = isPlainObject(v) && isPlainObject(a[k]) ? deepMerge(a[k], v) : v;
  return out;
};
// Paths like "tickets/t1" or "tickets/t1/messages/m1", as in Firestore.
const docRef = (path: string): any => ({
  id: path.split("/").pop()!,
  get: async () => {
    const data = store.get(path);
    return { id: path.split("/").pop()!, exists: !!data, data: () => (data ? { ...data } : undefined) };
  },
  set: async (data: DocData, opts?: { merge?: boolean }) => {
    const prev = store.get(path);
    store.set(path, opts?.merge && prev ? deepMerge(prev, data) : { ...data });
  },
  collection: (sub: string) => collectionRef(`${path}/${sub}`),
});
const collectionRef = (path: string) => ({
  doc: (id: string) => docRef(`${path}/${id}`),
  get: async () => {
    const docs = [...store.entries()]
      .filter(([k]) => k.startsWith(`${path}/`) && !k.slice(path.length + 1).includes("/"))
      .map(([k, data]) => ({ id: k.slice(path.length + 1), data: () => ({ ...data }) }));
    return { size: docs.length, docs };
  },
});
const fakeDb = {
  collection: (col: string) => collectionRef(col),
  runTransaction: async <T,>(fn: (tx: any) => Promise<T>) =>
    fn({ get: (ref: any) => ref.get(), set: (ref: any, data: DocData, opts?: { merge?: boolean }) => void ref.set(data, opts) }),
};
// "token-<uid>" is a valid ID token for <uid>.
vi.mock("./_lib/firebaseAdmin.js", () => ({
  adminDb: () => fakeDb,
  verifyIdToken: async (token: string | null) => {
    const { HttpError } = await import("./_lib/http.js");
    if (!token || !token.startsWith("token-")) throw new HttpError(401, "Invalid or expired sign-in. Please log in again.");
    return token.slice("token-".length);
  },
}));

import welcome from "./notify/welcome";
import ticket from "./notify/ticket";
import feedback from "./notify/feedback";
import ticketStatus from "./notify/ticket-status";
import ticketMessage from "./notify/ticket-message";
import cron from "./cron/expiry-reminders";

// ---------------- real SMTP server ----------------

type Received = { envelopeTo: string[]; envelopeFrom: string; mail: ParsedMail };
let inbox: Received[] = [];
let smtp: SMTPServer;
let api: Server;
let baseUrl = "";

beforeAll(async () => {
  smtp = new SMTPServer({
    secure: false,
    authOptional: false,
    allowInsecureAuth: true,
    disabledCommands: ["STARTTLS"],
    logger: false,
    onAuth(auth, _session, cb) {
      if (auth.username === "support@trinetrasystems.com" && auth.password === "test-pass") return cb(null, { user: auth.username });
      cb(new Error("Invalid username or password"));
    },
    onData(stream, session, cb) {
      simpleParser(stream).then((mail) => {
        inbox.push({
          mail,
          envelopeFrom: (session.envelope.mailFrom as { address: string }).address,
          envelopeTo: session.envelope.rcptTo.map((r) => r.address),
        });
        cb();
      }, cb);
    },
  });
  await new Promise<void>((resolve) => smtp.listen(0, "127.0.0.1", resolve));
  const smtpPort = (smtp.server.address() as AddressInfo).port;
  Object.assign(process.env, {
    SMTP_HOST: "127.0.0.1",
    SMTP_PORT: String(smtpPort),
    SMTP_SECURE: "false",
    SMTP_USER: "support@trinetrasystems.com",
    SMTP_PASS: "test-pass",
    CRON_SECRET: "cron-secret",
    PORTAL_URL: "https://www.trinetrasystems.com/admin",
  });

  const routes: Record<string, (req: any, res: any) => Promise<void>> = {
    "/api/notify/welcome": welcome,
    "/api/notify/ticket": ticket,
    "/api/notify/feedback": feedback,
    "/api/notify/ticket-status": ticketStatus,
    "/api/notify/ticket-message": ticketMessage,
    "/api/cron/expiry-reminders": cron,
  };
  api = createServer((req, res) => {
    const route = routes[(req.url || "").split("?")[0]];
    if (!route) {
      res.statusCode = 404;
      return res.end();
    }
    route(req, res);
  });
  await new Promise<void>((resolve) => api.listen(0, "127.0.0.1", resolve));
  baseUrl = `http://127.0.0.1:${(api.address() as AddressInfo).port}`;
});

afterAll(async () => {
  await new Promise((r) => api.close(r));
  await new Promise((r) => smtp.close(r as () => void));
});

const DAY = 86_400_000;
beforeEach(() => {
  inbox = [];
  store.clear();
  store.set("users/admin1", { username: "yash-admin", role: "admin", isMember: false });
  store.set("users/memberCreate", { username: "staff", role: "admin", isMember: true, permissions: ["create"] });
  store.set("users/memberNone", { username: "staff2", role: "admin", isMember: true, permissions: ["docs"] });
  store.set("users/cust1", {
    username: "acme",
    role: "user",
    isMember: false,
    contactEmail: "owner@acme.example",
    contactMobile: "+91 98765 43210",
    companyName: "Acme Foods <Pvt> Ltd",
    cameraCount: 16,
    planType: "subscription",
    softwareLifetime: false,
    softwareValidFrom: ts(new Date("2026-11-01T00:00:00+05:30")),
    softwareValidUntil: ts(new Date("2027-10-31T23:59:59+05:30")),
  });
  store.set("userPasswords/cust1", { password: "S3cret!pass" });
  store.set("userBilling/cust1", { planCost: 120000, amountPaid: 50000, depositAmount: 25000, depositRefunded: false, jetsonCount: 2, notes: "VIP" });
});

const post = (path: string, body: unknown, token?: string) =>
  fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });

// =====================================================================

describe("POST /api/notify/welcome", () => {
  it("emails the customer their portal link and credentials from support@ — with no pricing", async () => {
    const res = await post("/api/notify/welcome", { uid: "cust1" }, "token-admin1");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });

    expect(inbox).toHaveLength(1);
    const { mail, envelopeTo, envelopeFrom } = inbox[0];
    expect(envelopeFrom).toBe("support@trinetrasystems.com");
    expect(envelopeTo).toEqual(["owner@acme.example"]);
    expect(mail.from?.text).toContain("support@trinetrasystems.com");
    expect(mail.replyTo?.text).toContain("support@trinetrasystems.com");
    expect(mail.subject).toMatch(/Welcome to Trinetra Systems/);
    for (const body of [mail.text!, mail.html as string]) {
      expect(body).toContain("https://www.trinetrasystems.com/admin");
      expect(body).toContain("acme");
      expect(body).toContain("S3cret!pass");
      expect(body).toContain("Subscription");
      expect(body).not.toMatch(/120000|1,20,000|50000|25000|25,000|₹|VIP|Jetson|deposit/i);
    }
    // user-supplied company name is HTML-escaped
    expect(mail.html).toContain("Acme Foods &lt;Pvt&gt; Ltd");
    expect(mail.html).not.toContain("<Pvt>");

    expect(store.get("users/cust1")!.welcomeEmailSentAt).toBeInstanceOf(Date);
    expect(store.get("users/cust1")!.welcomeEmailTo).toBe("owner@acme.example");
  });

  it("does not send twice unless resend is requested", async () => {
    await post("/api/notify/welcome", { uid: "cust1" }, "token-admin1");
    const again = await post("/api/notify/welcome", { uid: "cust1" }, "token-admin1");
    expect(await again.json()).toEqual({ ok: true, skipped: true });
    expect(inbox).toHaveLength(1);
    const resend = await post("/api/notify/welcome", { uid: "cust1", resend: true }, "token-admin1");
    expect(resend.status).toBe(200);
    expect(inbox).toHaveLength(2);
  });

  it("requires a signed-in admin or a member with the create permission", async () => {
    expect((await post("/api/notify/welcome", { uid: "cust1" })).status).toBe(401);
    expect((await post("/api/notify/welcome", { uid: "cust1" }, "garbage")).status).toBe(401);
    expect((await post("/api/notify/welcome", { uid: "cust1" }, "token-cust1")).status).toBe(403);
    expect((await post("/api/notify/welcome", { uid: "cust1" }, "token-memberNone")).status).toBe(403);
    expect((await post("/api/notify/welcome", { uid: "cust1" }, "token-memberCreate")).status).toBe(200);
    expect(inbox).toHaveLength(1);
  });

  it("members cannot email staff accounts; bad input is rejected", async () => {
    store.set("users/admin1", { ...store.get("users/admin1"), contactEmail: "a@b.co" });
    expect((await post("/api/notify/welcome", { uid: "admin1" }, "token-memberCreate")).status).toBe(403);
    expect((await post("/api/notify/welcome", { uid: "nope" }, "token-admin1")).status).toBe(404);
    expect((await post("/api/notify/welcome", { uid: "../x" }, "token-admin1")).status).toBe(400);
    store.set("users/cust1", { ...store.get("users/cust1"), contactEmail: "not-an-email" });
    expect((await post("/api/notify/welcome", { uid: "cust1" }, "token-admin1")).status).toBe(422);
    expect(inbox).toHaveLength(0);
  });

  it("rejects GET", async () => {
    expect((await fetch(`${baseUrl}/api/notify/welcome`)).status).toBe(405);
  });

  it("returns 503 when SMTP is not configured", async () => {
    const saved = process.env.SMTP_PASS;
    delete process.env.SMTP_PASS;
    try {
      const res = await post("/api/notify/welcome", { uid: "cust1" }, "token-admin1");
      expect(res.status).toBe(503);
      expect((await res.json()).error).toMatch(/not configured/);
      expect(store.get("users/cust1")!.welcomeEmailSentAt).toBeUndefined();
    } finally {
      process.env.SMTP_PASS = saved;
    }
  });
});

describe("POST /api/notify/ticket", () => {
  beforeEach(() => {
    store.set("tickets/t1", {
      ticketNumber: "TKT-123456",
      userId: "cust1",
      userEmail: "owner@acme.example",
      userName: "acme",
      phone: "+91 98765 43210",
      category: "Detection Not Working",
      title: "Camera 4 <offline>",
      description: "Since morning\nno alerts",
      severity: "Medium",
      status: "Active",
      createdAt: ts(new Date()),
    });
  });

  it("emails support@ immediately with the ticket details", async () => {
    const res = await post("/api/notify/ticket", { ticketId: "t1" });
    expect(res.status).toBe(200);
    expect(inbox).toHaveLength(1);
    const { mail, envelopeTo } = inbox[0];
    expect(envelopeTo).toEqual(["support@trinetrasystems.com"]);
    expect(mail.subject).toBe("[Ticket TKT-123456] Camera 4 <offline>");
    expect(mail.replyTo?.text).toContain("owner@acme.example");
    expect(mail.text).toContain("Detection Not Working");
    expect(mail.text).toContain("Since morning\nno alerts");
    expect(mail.text).toContain("Acme Foods <Pvt> Ltd");
    expect(mail.html).toContain("Camera 4 &lt;offline&gt;");
    expect(store.get("tickets/t1")!.notifiedAt).toBeInstanceOf(Date);
  });

  it("is idempotent and ignores stale or unknown tickets", async () => {
    await post("/api/notify/ticket", { ticketId: "t1" });
    expect(await (await post("/api/notify/ticket", { ticketId: "t1" })).json()).toEqual({ ok: true, skipped: true });
    store.set("tickets/old", { title: "old", createdAt: ts(new Date(Date.now() - 3 * DAY)) });
    expect(await (await post("/api/notify/ticket", { ticketId: "old" })).json()).toEqual({ ok: true, skipped: true });
    expect((await post("/api/notify/ticket", { ticketId: "missing" })).status).toBe(404);
    expect((await post("/api/notify/ticket", {})).status).toBe(400);
    expect(inbox).toHaveLength(1);
  });
});

const webTicket = () => ({
  ticketNumber: "TKT-123456",
  userId: "cust1",
  userEmail: "acme@trinetra.local", // login address — not deliverable, profile email wins
  userName: "acme",
  phone: "+91 98765 43210",
  category: "Detection Not Working",
  title: "Camera 4 <offline>",
  description: "Since morning",
  severity: "Medium",
  status: "In Progress",
  createdAt: ts(new Date()),
});

describe("POST /api/notify/ticket-status", () => {
  beforeEach(() => {
    store.set("users/memberTickets", { username: "desk", role: "admin", isMember: true, permissions: ["tickets"] });
    store.set("tickets/t1", webTicket());
  });

  it("emails the customer's registered email from support@, with a hidden copy to support@", async () => {
    const res = await post("/api/notify/ticket-status", { ticketId: "t1" }, "token-admin1");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, to: "owner@acme.example" });
    expect(inbox).toHaveLength(1);
    const { mail, envelopeTo, envelopeFrom } = inbox[0];
    expect(envelopeFrom).toBe("support@trinetrasystems.com");
    expect(envelopeTo.sort()).toEqual(["owner@acme.example", "support@trinetrasystems.com"]);
    expect(mail.to && "text" in mail.to ? mail.to.text : "").toBe("owner@acme.example"); // support@ is a hidden copy
    expect(mail.from?.text).toContain("support@trinetrasystems.com");
    expect(mail.subject).toBe("[Ticket TKT-123456] Status updated: In Progress");
    expect(mail.text).toContain("Our team is now working on your ticket.");
    expect(mail.text).toContain("https://www.trinetrasystems.com/admin");
    expect(mail.html).toContain("Camera 4 &lt;offline&gt;");
    expect(store.get("tickets/t1")!.statusEmailed).toBe("In Progress");
  });

  it("emails each status change once; a later change emails again", async () => {
    await post("/api/notify/ticket-status", { ticketId: "t1" }, "token-admin1");
    expect(await (await post("/api/notify/ticket-status", { ticketId: "t1" }, "token-admin1")).json()).toEqual({
      ok: true,
      skipped: true,
      reason: "already-notified",
    });
    store.set("tickets/t1", { ...store.get("tickets/t1")!, status: "Solved" });
    expect((await post("/api/notify/ticket-status", { ticketId: "t1" }, "token-admin1")).status).toBe(200);
    expect(inbox.map((m) => m.mail.subject)).toEqual([
      "[Ticket TKT-123456] Status updated: In Progress",
      "[Ticket TKT-123456] Status updated: Solved",
    ]);
    expect(inbox[1].mail.text).toContain("marked as solved");
  });

  it("only staff with the tickets permission can trigger it", async () => {
    expect((await post("/api/notify/ticket-status", { ticketId: "t1" })).status).toBe(401);
    expect((await post("/api/notify/ticket-status", { ticketId: "t1" }, "token-cust1")).status).toBe(403);
    expect((await post("/api/notify/ticket-status", { ticketId: "t1" }, "token-memberNone")).status).toBe(403);
    expect((await post("/api/notify/ticket-status", { ticketId: "nope" }, "token-admin1")).status).toBe(404);
    expect((await post("/api/notify/ticket-status", {}, "token-admin1")).status).toBe(400);
    expect(inbox).toHaveLength(0);
    expect((await post("/api/notify/ticket-status", { ticketId: "t1" }, "token-memberTickets")).status).toBe(200);
    expect(inbox).toHaveLength(1);
  });

  it("works for existing mobile-app tickets (open/done, username only) and skips customers without an email", async () => {
    store.set("loginIndex/acme", { userId: "cust1", username: "acme" });
    store.set("tickets/app1", { id: "TKT-1007", title: "Gate cam", status: "open", createdBy: "Acme", createdAt: ts(new Date()) });
    const res = await post("/api/notify/ticket-status", { ticketId: "app1" }, "token-admin1");
    expect(await res.json()).toEqual({ ok: true, to: "owner@acme.example" });
    expect(inbox[0].mail.subject).toBe("[Ticket TKT-1007] Status updated: Active");

    store.set("tickets/orphan", { title: "x", status: "done", userEmail: "ghost@trinetra.local", createdAt: ts(new Date()) });
    expect(await (await post("/api/notify/ticket-status", { ticketId: "orphan" }, "token-admin1")).json()).toEqual({
      ok: true,
      skipped: true,
      reason: "no-email",
    });
    expect(inbox).toHaveLength(1);
  });

  it("releases the claim when SMTP fails so the admin can retry", async () => {
    const saved = process.env.SMTP_PASS;
    process.env.SMTP_PASS = "wrong-password";
    try {
      expect((await post("/api/notify/ticket-status", { ticketId: "t1" }, "token-admin1")).status).toBe(500);
      expect(store.get("tickets/t1")!.statusEmailed).toBeNull();
    } finally {
      process.env.SMTP_PASS = saved;
    }
    expect((await post("/api/notify/ticket-status", { ticketId: "t1" }, "token-admin1")).status).toBe(200);
    expect(inbox).toHaveLength(1);
  });
});

describe("POST /api/notify/ticket-message", () => {
  beforeEach(() => {
    store.set("users/cust2", { username: "other", role: "user", isMember: false, contactEmail: "other@example.com" });
    store.set("tickets/t1", webTicket());
    store.set("tickets/t1/messages/s1", {
      from: "support",
      text: "We restarted the <NVR>.\nPlease check camera 4.",
      type: "text",
      createdAt: ts(new Date()),
      authorUid: "admin1",
      authorName: "yash-admin",
    });
    store.set("tickets/t1/messages/u1", { from: "user", text: "Still offline on cam 4", type: "text", createdAt: ts(new Date()), authorUid: "cust1" });
  });

  it("support reply → customer's registered email, hidden copy to support@, once", async () => {
    const res = await post("/api/notify/ticket-message", { ticketId: "t1", messageId: "s1" }, "token-admin1");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, to: "owner@acme.example" });
    const { mail, envelopeTo } = inbox[0];
    expect(envelopeTo.sort()).toEqual(["owner@acme.example", "support@trinetrasystems.com"]);
    expect(mail.subject).toBe("[Ticket TKT-123456] New reply from Trinetra Support");
    expect(mail.text).toContain("We restarted the <NVR>.\nPlease check camera 4.");
    expect(mail.html).toContain("We restarted the &lt;NVR&gt;.");
    expect(mail.replyTo?.text).toContain("support@trinetrasystems.com");
    expect(store.get("tickets/t1/messages/s1")!.notifiedAt).toBeInstanceOf(Date);

    expect(await (await post("/api/notify/ticket-message", { ticketId: "t1", messageId: "s1" }, "token-admin1")).json()).toEqual({
      ok: true,
      skipped: true,
      reason: "already-notified",
    });
    expect(inbox).toHaveLength(1);
  });

  it("customer message → support@ only, Reply-To the customer", async () => {
    const res = await post("/api/notify/ticket-message", { ticketId: "t1", messageId: "u1" }, "token-cust1");
    expect(res.status).toBe(200);
    const { mail, envelopeTo } = inbox[0];
    expect(envelopeTo).toEqual(["support@trinetrasystems.com"]);
    expect(mail.subject).toBe("[Ticket TKT-123456] New message from Acme Foods <Pvt> Ltd: Camera 4 <offline>");
    expect(mail.replyTo?.text).toContain("owner@acme.example");
    expect(mail.text).toContain("Still offline on cam 4");
    expect(mail.text).toContain("Status: In Progress");
  });

  it("only the right side can trigger each email", async () => {
    const call = (messageId: string, token?: string) => post("/api/notify/ticket-message", { ticketId: "t1", messageId }, token);
    expect((await call("s1")).status).toBe(401);
    expect((await call("s1", "token-cust1")).status).toBe(403); // customers can't send "support" emails
    expect((await call("s1", "token-memberNone")).status).toBe(403);
    expect((await call("u1", "token-cust2")).status).toBe(403); // not their ticket
    expect((await call("u1", "token-admin1")).status).toBe(403); // staff can't send as the customer
    expect((await call("missing", "token-admin1")).status).toBe(404);
    expect((await post("/api/notify/ticket-message", { ticketId: "t1" }, "token-admin1")).status).toBe(400);
    expect(inbox).toHaveLength(0);
  });

  it("skips messages older than 24h and rejects empty ones", async () => {
    store.set("tickets/t1/messages/old", { from: "support", text: "old", createdAt: ts(new Date(Date.now() - 2 * DAY)) });
    expect(await (await post("/api/notify/ticket-message", { ticketId: "t1", messageId: "old" }, "token-admin1")).json()).toEqual({
      ok: true,
      skipped: true,
      reason: "stale",
    });
    store.set("tickets/t1/messages/empty", { from: "user", text: "  ", createdAt: ts(new Date()) });
    expect((await post("/api/notify/ticket-message", { ticketId: "t1", messageId: "empty" }, "token-cust1")).status).toBe(400);
    expect(inbox).toHaveLength(0);
  });

  it("works on mobile-app tickets that only carry the username", async () => {
    store.set("loginIndex/acme", { userId: "cust1", username: "acme" });
    store.set("tickets/app1", { id: "TKT-1007", title: "Gate cam", status: "done", createdBy: "acme", createdAt: ts(new Date()) });
    store.set("tickets/app1/messages/u9", { from: "user", text: "Works now?", type: "text", createdAt: ts(new Date()) });
    store.set("tickets/app1/messages/s9", { from: "support", text: "Yes, fixed.", type: "text", createdAt: ts(new Date()) });
    expect((await post("/api/notify/ticket-message", { ticketId: "app1", messageId: "u9" }, "token-cust1")).status).toBe(200);
    expect((await post("/api/notify/ticket-message", { ticketId: "app1", messageId: "s9" }, "token-admin1")).status).toBe(200);
    expect(inbox.map((m) => m.mail.subject)).toEqual([
      "[Ticket TKT-1007] New message from Acme Foods <Pvt> Ltd: Gate cam",
      "[Ticket TKT-1007] New reply from Trinetra Support",
    ]);
    expect(inbox[1].envelopeTo).toContain("owner@acme.example");
  });
});

describe("POST /api/notify/feedback", () => {
  beforeEach(() => {
    store.set("feedback/cust1", { rating: 4, message: "Great alerts, <b>fast</b> support", createdAt: ts(new Date()) });
  });

  it("forwards the signed-in user's feedback to support@ once", async () => {
    const res = await post("/api/notify/feedback", {}, "token-cust1");
    expect(res.status).toBe(200);
    expect(inbox).toHaveLength(1);
    const { mail, envelopeTo } = inbox[0];
    expect(envelopeTo).toEqual(["support@trinetrasystems.com"]);
    expect(mail.subject).toBe("Feedback from Acme Foods <Pvt> Ltd — 4/5");
    expect(mail.text).toContain("★★★★☆ (4/5)");
    expect(mail.html).toContain("&lt;b&gt;fast&lt;/b&gt;");
    expect(mail.replyTo?.text).toContain("owner@acme.example");

    expect(await (await post("/api/notify/feedback", {}, "token-cust1")).json()).toEqual({ ok: true, skipped: true });
    expect(inbox).toHaveLength(1);
  });

  it("requires sign-in and existing feedback", async () => {
    expect((await post("/api/notify/feedback", {})).status).toBe(401);
    expect((await post("/api/notify/feedback", {}, "token-admin1")).status).toBe(404);
    expect(inbox).toHaveLength(0);
  });
});

describe("GET /api/cron/expiry-reminders", () => {
  const callCron = (secret = "cron-secret") =>
    fetch(`${baseUrl}/api/cron/expiry-reminders`, { headers: { Authorization: `Bearer ${secret}` } });

  beforeEach(() => {
    const now = Date.now();
    // subscription expiring in 5 days → due
    store.set("users/cust1", { ...store.get("users/cust1"), softwareValidUntil: ts(new Date(now + 5 * DAY)) });
    // lifetime with maintenance expiring in 7 days → due (maintenance)
    store.set("users/life1", {
      username: "beta",
      role: "user",
      companyName: "Beta Mart",
      planType: "lifetime",
      softwareLifetime: true,
      maintenanceValidUntil: ts(new Date(now + 7 * DAY - 60_000)),
    });
    store.set("userBilling/life1", { planCost: 300000, amountPaid: 300000, maintenanceCost: 15000 });
    // not due: 20 days away, already expired, lifetime w/o maintenance, staff account
    store.set("users/far", { role: "user", softwareValidUntil: ts(new Date(now + 20 * DAY)) });
    store.set("users/expiredLongAgo", { role: "user", softwareValidUntil: ts(new Date(now - 40 * DAY)) });
    store.set("users/life2", { role: "user", planType: "lifetime", softwareLifetime: true });
    store.set("users/admin1", { role: "admin", softwareValidUntil: ts(new Date(now + 2 * DAY)) });
  });

  it("rejects calls without the cron secret", async () => {
    expect((await callCron("wrong")).status).toBe(401);
    expect(inbox).toHaveLength(0);
  });

  it("emails contact@ and support@ 7 days before expiry, once per expiry date", async () => {
    const res = await callCron();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.sent.sort()).toEqual(["cust1:subscription", "life1:maintenance"]);
    expect(inbox).toHaveLength(2);
    for (const { envelopeTo } of inbox) {
      expect(envelopeTo.sort()).toEqual(["contact@trinetrasystems.com", "support@trinetrasystems.com"]);
    }
    const acme = inbox.find((m) => m.mail.subject!.includes("Acme"))!.mail;
    expect(acme.subject).toMatch(/^Renewal due: Acme Foods <Pvt> Ltd — Subscription expires/);
    expect(acme.text).toContain("in 5 days");
    expect(acme.text).toContain("Balance to receive: ₹70,000"); // internal email may show money
    expect(acme.text).toContain("Jetsons: 2");
    expect(acme.text).toContain("Security deposit: ₹25,000 (held)");
    const beta = inbox.find((m) => m.mail.subject!.includes("Beta"))!.mail;
    expect(beta.text).toContain("Maintenance (lifetime solution)");
    expect(beta.text).toContain("in 7 days");
    expect(beta.text).toContain("Maintenance charge: ₹15,000");

    // Second run the same day: nothing new.
    const again = await (await callCron()).json();
    expect(again.sent).toEqual([]);
    expect(inbox).toHaveLength(2);

    // Renewed to a new end date that is again within 7 days → reminds again.
    store.set("users/cust1", { ...store.get("users/cust1"), softwareValidUntil: ts(new Date(Date.now() + 6 * DAY)) });
    expect((await (await callCron()).json()).sent).toEqual(["cust1:subscription"]);
    expect(inbox).toHaveLength(3);
  });

  it("catches up on an expiry that was never reminded (e.g. plan saved with a past end date)", async () => {
    store.set("users/lapsed", {
      username: "gamma",
      role: "user",
      companyName: "Gamma Retail",
      planType: "subscription",
      softwareValidUntil: ts(new Date(Date.now() - 2 * DAY)),
    });
    const body = await (await callCron()).json();
    expect(body.sent).toContain("lapsed:subscription");
    const gamma = inbox.find((m) => m.mail.subject!.includes("Gamma"))!;
    expect(gamma.mail.subject).toMatch(/^EXPIRED: Gamma Retail — Subscription expired/);
    expect(gamma.mail.text).toContain("No earlier reminder was sent");
    expect(gamma.envelopeTo.sort()).toEqual(["contact@trinetrasystems.com", "support@trinetrasystems.com"]);
    // only once
    expect((await (await callCron()).json()).sent).toEqual([]);
  });

  it("dry run lists what is due without sending or marking anything; ?only limits to one customer", async () => {
    const dry = await (await fetch(`${baseUrl}/api/cron/expiry-reminders?dryRun=1`, { headers: { Authorization: "Bearer cron-secret" } })).json();
    expect(dry.dryRun).toBe(true);
    expect(dry.due.map((d: any) => `${d.uid}:${d.kind}`).sort()).toEqual(["cust1:subscription", "life1:maintenance"]);
    expect(inbox).toHaveLength(0);
    expect(store.get("users/cust1")!.expiryReminders).toBeUndefined();

    const one = await (await fetch(`${baseUrl}/api/cron/expiry-reminders?only=life1`, { headers: { Authorization: "Bearer cron-secret" } })).json();
    expect(one.sent).toEqual(["life1:maintenance"]);
    expect(inbox).toHaveLength(1);
    expect(store.get("users/cust1")!.expiryReminders).toBeUndefined();
  });

  it("does not mark reminders as sent when SMTP fails, so the next run retries", async () => {
    const saved = process.env.SMTP_PASS;
    process.env.SMTP_PASS = "wrong-password";
    try {
      const res = await callCron();
      expect(res.status).toBe(207);
      const body = await res.json();
      expect(body.failed).toHaveLength(2);
    expect(inbox).toHaveLength(0);
      expect(store.get("users/cust1")!.expiryReminders).toBeUndefined();
    } finally {
      process.env.SMTP_PASS = saved;
    }
    expect((await (await callCron()).json()).sent).toHaveLength(2);
  });
});
