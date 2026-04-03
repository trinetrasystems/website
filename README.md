# Trinetra Systems Firebase Demo

This page now supports:

- Public users can submit a form without login
- Admin users can log in and view all submitted forms
- Live submission list for admins from Firestore

## Files

- `index.html`: UI and Firebase logic
- `firebase-config.js`: Firebase app config

## Setup

1. Create a Firebase project at <https://console.firebase.google.com/>
2. Add a **Web app** in project settings
3. Paste your web config into `firebase-config.js`
4. In **Authentication → Sign-in method**, enable **Email/Password**
5. Create **Cloud Firestore** in the same project
6. Create at least one admin auth user in **Authentication → Users**
7. In Firestore, create document `admins/{adminUid}` for each admin user
8. `adminUid` is the Firebase Auth user UID. You can copy it from Authentication users list.

## Firestore Collections Used

- `publicSubmissions`: Stores all public form entries
- `admins`: Stores which authenticated users are admins (`documentId = uid`)

## Recommended Firestore Rules

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /publicSubmissions/{submissionId} {
      allow create: if true;
      allow read: if request.auth != null
                  && exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }

    match /admins/{uid} {
      allow read: if request.auth != null && request.auth.uid == uid;
      allow write: if false;
    }
  }
}
```

## Run Locally

```powershell
Set-Location "y:\Trinetra\website"
python -m http.server 5500
```

Open `http://localhost:5500`

## Note

This app uses Firebase CDN modules directly. No `package.json` or build step is required.
