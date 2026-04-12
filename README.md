# Trinetra Website

## Firebase Admin Setup

- Create a `.env` file from `.env.example` and fill in your Firebase config values.
- Enable Firebase Authentication with email/password.
- Store each user in the Firestore `users` collection with `username`, `usernameKey`, `authEmail`, `role`, and `ip_link` fields.
- Keep usernames unique, because the admin page now resolves username + password to the saved Firebase Auth email internally.
- Add your admin user's Firestore profile with `role: "admin"`.
- Open `/admin` and log in with username and password to view the dashboard.
