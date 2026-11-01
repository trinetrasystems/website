import nodemailer, { type Transporter } from "nodemailer";
import { ConfigError } from "./http.js";

// All mail goes out from the support mailbox over SMTP.
//   SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS  (+ optional SMTP_SECURE)
// e.g. Google Workspace: smtp.gmail.com:465 with an App Password,
//      Zoho: smtp.zoho.in:465, Hostinger: smtp.hostinger.com:465.

export const mailConfig = () => ({
  from: process.env.MAIL_FROM || "Trinetra Systems Support <support@trinetrasystems.com>",
  supportEmail: process.env.SUPPORT_EMAIL || "support@trinetrasystems.com",
  contactEmail: process.env.CONTACT_EMAIL || "contact@trinetrasystems.com",
  portalUrl: process.env.PORTAL_URL || "https://www.trinetrasystems.com/admin",
});

let cached: { key: string; transporter: Transporter } | null = null;

const getTransporter = (): Transporter => {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    throw new ConfigError("Email service is not configured: SMTP_HOST / SMTP_USER / SMTP_PASS missing.");
  }
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465;
  const key = [host, port, secure, user, pass].join("|");
  if (!cached || cached.key !== key) {
    cached = {
      key,
      transporter: nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
        // Local test SMTP servers use self-signed certs.
        tls: process.env.SMTP_ALLOW_SELF_SIGNED === "true" ? { rejectUnauthorized: false } : undefined,
      }),
    };
  }
  return cached.transporter;
};

export type OutgoingMail = {
  to: string | string[];
  /** Hidden copy — used to keep support@ in the loop on customer emails. */
  bcc?: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

export const sendMail = async (mail: OutgoingMail) => {
  const { from } = mailConfig();
  const info = await getTransporter().sendMail({ from, ...mail });
  return { messageId: info.messageId, accepted: info.accepted };
};
