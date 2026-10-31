# Trinetra Website

## Firebase Admin Setup

- Create a `.env` file from `.env.example` and fill in your Firebase config values.
- Enable Firebase Authentication with email/password.
- Store each user in the Firestore `users` collection with `username`, `usernameKey`, `authEmail`, `role`, and `ip_link` fields.
- Keep usernames unique, because the admin page now resolves username + password to the saved Firebase Auth email internally.
- Add your admin user's Firestore profile with `role: "admin"`.
- Open `/admin` and log in with username and password to view the dashboard.

## Customer plans, billing & email notifications

**Data**
- `users/{uid}` (the customer can read their own): `companyName`, `cameraCount`, `planType` (`subscription` | `lifetime`), `softwareValidFrom/Until` + renewal duration (subscription), `maintenanceValidFrom/Until` + duration (lifetime solution).
- `userBilling/{uid}` (staff only, see `firestore.rules`): `planCost`, `amountPaid`, `maintenanceCost`, `jetsonCount`, `notes`. Never shown on the customer dashboard.
- `feedback/{uid}`: one-time customer feedback (create-only).

**Emails** — Vercel functions in `/api`, sent over SMTP from support@:
| Trigger | Endpoint | To |
|---|---|---|
| Admin creates a customer (or clicks *Resend Welcome Email*) | `POST /api/notify/welcome` | customer's contact email — portal link + credentials |
| Customer raises a ticket | `POST /api/notify/ticket` | support@ |
| Customer submits feedback | `POST /api/notify/feedback` | support@ |
| Daily 09:00 IST (Vercel Cron) — plan/maintenance expires within 7 days | `GET /api/cron/expiry-reminders` | contact@ + support@ |

Set the server env vars listed at the bottom of `.env.example` in Vercel. `npm run dev` serves `/api` locally too.

**Tests**
- `npm test` — unit tests + API integration tests (real local SMTP server, faked Firestore).
- `npx playwright test -c e2e/playwright.config.ts` — browser end-to-end tests against an in-memory Firebase fake (`vite --mode e2e`).
