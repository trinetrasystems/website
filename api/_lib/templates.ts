// Email bodies. Every value that came from a user or the database is escaped.

export const escapeHtml = (value: unknown): string =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const toDate = (value: any): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value.toDate === "function") return value.toDate();
  return null;
};

/** "31 Oct 2027" in India time (the cron runs in UTC). */
export const formatDate = (value: any): string => {
  const date = toDate(value);
  return date
    ? date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" })
    : "—";
};

const formatDateTime = (value: any): string => {
  const date = toDate(value);
  return date
    ? date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" })
    : "—";
};

const rupees = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value)
    ? `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
    : "—";

const layout = (heading: string, inner: string) => `<!doctype html>
<html><body style="margin:0;background:#f4f6fb;font-family:Segoe UI,Arial,sans-serif;color:#1d2433">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e3e7f0">
<tr><td style="background:#0b1530;padding:20px 28px;color:#ffffff;font-size:18px;font-weight:700;letter-spacing:.3px">Trinetra Systems</td></tr>
<tr><td style="padding:28px">
<h1 style="margin:0 0 16px;font-size:20px;color:#0b1530">${escapeHtml(heading)}</h1>
${inner}
</td></tr>
<tr><td style="padding:16px 28px;background:#f8f9fc;color:#6b7385;font-size:12px">Trinetra Systems · support@trinetrasystems.com · www.trinetrasystems.com</td></tr>
</table></td></tr></table></body></html>`;

const rows = (pairs: [string, string][]) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:12px 0 20px;font-size:14px">${pairs
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 12px;border:1px solid #e3e7f0;background:#f8f9fc;width:38%;color:#4a5265">${escapeHtml(
          k
        )}</td><td style="padding:8px 12px;border:1px solid #e3e7f0">${v}</td></tr>`
    )
    .join("")}</table>`;

const textRows = (pairs: [string, string][]) => pairs.map(([k, v]) => `${k}: ${v}`).join("\n");

const planSummary = (user: any): [string, string][] => {
  const lifetime = user.planType ? user.planType === "lifetime" : user.softwareLifetime === true;
  if (lifetime) {
    const out: [string, string][] = [["Plan", "Lifetime Solution"]];
    if (user.maintenanceValidUntil) {
      out.push(["Maintenance validity", `${formatDate(user.maintenanceValidFrom)} – ${formatDate(user.maintenanceValidUntil)}`]);
    }
    return out;
  }
  const until = user.softwareValidUntil ?? user.validUntil;
  if (!until) return [["Plan", "Subscription"]];
  return [
    ["Plan", "Subscription"],
    ["Validity", `${formatDate(user.softwareValidFrom)} – ${formatDate(until)}`],
  ];
};

// ---------------------------------------------------------------------------

export const welcomeEmail = (args: { user: any; password: string; portalUrl: string; supportEmail: string }) => {
  const { user, password, portalUrl, supportEmail } = args;
  const name = user.companyName || user.username || "Customer";
  // Plan type and validity only — pricing is never sent to the customer.
  const details: [string, string][] = [
    ["Portal", portalUrl],
    ["Username", user.username || ""],
    ["Password", password || "(ask your Trinetra contact)"],
    ...planSummary(user),
  ];
  const html = layout(
    "Your Trinetra portal account is ready",
    `<p style="font-size:15px;line-height:1.6;margin:0 0 12px">Hello ${escapeHtml(name)},</p>
<p style="font-size:15px;line-height:1.6;margin:0 0 4px">You have been successfully registered on the Trinetra Systems customer portal. Use the details below to sign in, view your live dashboard, track your subscription validity and raise support tickets.</p>
${rows(details.map(([k, v]) => [k, k === "Portal" ? `<a href="${escapeHtml(v)}" style="color:#1f5eff">${escapeHtml(v)}</a>` : k === "Password" || k === "Username" ? `<code style="font-size:14px">${escapeHtml(v)}</code>` : escapeHtml(v)]))}
<p style="margin:0 0 20px"><a href="${escapeHtml(portalUrl)}" style="display:inline-block;background:#1f5eff;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:600">Open the portal</a></p>
<p style="font-size:13px;line-height:1.6;color:#4a5265;margin:0">For your security, please change your password after the first login (Dashboard → Reset Password). Need help? Reply to this email or write to <a href="mailto:${escapeHtml(supportEmail)}">${escapeHtml(supportEmail)}</a>.</p>`
  );
  const text = `Hello ${name},

You have been successfully registered on the Trinetra Systems customer portal.

${textRows(details)}

For your security, please change your password after the first login.
Need help? Write to ${supportEmail}.

— Trinetra Systems`;
  return { subject: "Welcome to Trinetra Systems — your portal login details", html, text };
};

export const ticketEmail = (args: { ticketId: string; ticket: any; user: any | null }) => {
  const { ticketId, ticket, user } = args;
  const number = ticket.ticketNumber || ticketId;
  const details: [string, string][] = [
    ["Ticket", number],
    ["Title", ticket.title || ""],
    ["Category", ticket.category || ""],
    ["Severity", ticket.severity || ""],
    ["Raised by", ticket.userName || user?.username || ""],
    ["Company", user?.companyName || ""],
    ["Email", ticket.userEmail || user?.contactEmail || ""],
    ["Phone", ticket.phone || user?.contactMobile || ""],
    ["Raised at", formatDateTime(ticket.createdAt)],
  ];
  const html = layout(
    `New support ticket ${number}`,
    `${rows(details.map(([k, v]) => [k, escapeHtml(v || "—")]))}
<p style="font-size:13px;font-weight:600;margin:0 0 6px;color:#4a5265">Description</p>
<div style="white-space:pre-wrap;font-size:14px;line-height:1.6;border:1px solid #e3e7f0;border-radius:8px;padding:12px;background:#f8f9fc">${escapeHtml(
      ticket.description || ""
    )}</div>
<p style="font-size:13px;color:#4a5265;margin:16px 0 0">Open the admin console → Support Tickets to respond.</p>`
  );
  const text = `New support ticket ${number}\n\n${textRows(details.map(([k, v]) => [k, v || "—"]))}\n\nDescription:\n${ticket.description || ""}`;
  return { subject: `[Ticket ${number}] ${String(ticket.title || "New support ticket").slice(0, 120)}`, html, text };
};

export const feedbackEmail = (args: { feedback: any; user: any | null }) => {
  const { feedback, user } = args;
  const rating = Number(feedback.rating) || 0;
  const stars = "★".repeat(rating) + "☆".repeat(Math.max(0, 5 - rating));
  const details: [string, string][] = [
    ["Rating", `${stars} (${rating}/5)`],
    ["User", user?.username || feedback.username || ""],
    ["Company", user?.companyName || feedback.companyName || ""],
    ["Email", user?.contactEmail || ""],
    ["Phone", user?.contactMobile || ""],
    ["Submitted", formatDateTime(feedback.createdAt)],
  ];
  const html = layout(
    "New customer feedback",
    `${rows(details.map(([k, v]) => [k, escapeHtml(v || "—")]))}
<p style="font-size:13px;font-weight:600;margin:0 0 6px;color:#4a5265">Feedback</p>
<div style="white-space:pre-wrap;font-size:14px;line-height:1.6;border:1px solid #e3e7f0;border-radius:8px;padding:12px;background:#f8f9fc">${escapeHtml(
      feedback.message || ""
    )}</div>`
  );
  const text = `New customer feedback\n\n${textRows(details.map(([k, v]) => [k, v || "—"]))}\n\nFeedback:\n${feedback.message || ""}`;
  const who = user?.companyName || user?.username || "a customer";
  return { subject: `Feedback from ${who} — ${rating}/5`, html, text };
};

export const expiryReminderEmail = (args: {
  user: any;
  billing: any | null;
  kind: "subscription" | "maintenance";
  expiresAt: Date;
  daysLeft: number;
}) => {
  const { user, billing, kind, expiresAt, daysLeft } = args;
  const who = user.companyName || user.username || "Customer";
  const what = kind === "subscription" ? "Subscription" : "Maintenance (lifetime solution)";
  const overdue = expiresAt.getTime() <= Date.now();
  const dueIn = overdue ? "— already expired" : daysLeft <= 1 ? "within 1 day" : `in ${daysLeft} days`;
  const balance =
    billing && typeof billing.planCost === "number"
      ? Math.max(0, billing.planCost - (typeof billing.amountPaid === "number" ? billing.amountPaid : 0))
      : null;
  // Internal email to Trinetra — includes the money position to help the renewal call.
  const details: [string, string][] = [
    ["Company", user.companyName || "—"],
    ["Username", user.username || "—"],
    ["Plan", what],
    ["Current period", `${formatDate(kind === "subscription" ? user.softwareValidFrom : user.maintenanceValidFrom)} – ${formatDate(expiresAt)}`],
    ["Expires", `${formatDate(expiresAt)} (${dueIn})`],
    ["Cameras", user.cameraCount != null ? String(user.cameraCount) : "—"],
    ["Jetsons", billing?.jetsonCount != null ? String(billing.jetsonCount) : "—"],
    ["Contact email", user.contactEmail || "—"],
    ["Contact mobile", user.contactMobile || "—"],
  ];
  if (billing) {
    details.push(["Plan cost", rupees(billing.planCost)], ["Amount received", rupees(billing.amountPaid)], ["Balance to receive", rupees(balance)]);
    if (kind === "maintenance") details.push(["Maintenance charge", rupees(billing.maintenanceCost)]);
    if (typeof billing.depositAmount === "number") {
      details.push(["Security deposit", `${rupees(billing.depositAmount)} (${billing.depositRefunded ? "refunded" : "held"})`]);
    }
    if (billing.notes) details.push(["Notes", String(billing.notes)]);
  }
  const html = layout(
    overdue ? `${what} for ${who} has expired` : `${what} for ${who} expires ${dueIn}`,
    `<p style="font-size:15px;line-height:1.6;margin:0 0 4px">${
      overdue
        ? "This plan has already expired and no earlier reminder was sent. Please contact the customer about renewal."
        : "This is an automatic reminder sent 7 days before expiry. Please contact the customer about renewal."
    }</p>
${rows(details.map(([k, v]) => [k, escapeHtml(v)]))}`
  );
  const text = overdue
    ? `${what} for ${who} has expired (${formatDate(expiresAt)}). No earlier reminder was sent.\n\n${textRows(details)}`
    : `${what} for ${who} expires ${dueIn}.\n\n${textRows(details)}`;
  const subject = overdue
    ? `EXPIRED: ${who} — ${what.split(" (")[0]} expired ${formatDate(expiresAt)}`
    : `Renewal due: ${who} — ${what.split(" (")[0]} expires ${formatDate(expiresAt)}`;
  return { subject, html, text };
};
