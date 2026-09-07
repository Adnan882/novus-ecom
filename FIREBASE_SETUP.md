# Firebase setup guide (Novus)

The app is fully wired to Firebase, but **the project itself must be created by you** — it needs your Google account. Paste your keys below in 5 minutes and everything (sign-in, saved addresses, order history) starts syncing to Firestore.

> Before keys are added the store runs in **demo mode**: it falls back to `localStorage` (`novus-account`, `novus-addresses`, `novus-orders`) so you can still test every flow. After adding keys, real accounts work and demo data is ignored.

---

## 1. Create a Firebase project

1. Go to https://console.firebase.google.com → **Add project** → name it (e.g. `novus-ecom`).
2. Google Analytics is optional — skip it to stay on the free tier.
3. (If asked to upgrade to Blaze, note: the **Spark (free) plan** includes a `firestore(-dev)`-style free tier via a Cloud project.) You do **not** need a paid plan.

## 2. Enable sign-in methods

1. In the project, open **Build → Authentication → Get started**.
2. **Sign-in method** tab → enable **Google**, **Email/Password**, and **Phone**.
3. Add your own email as an **authorised domain / test user** if prompted.

## 3. Create the database

1. Open **Build → Firestore Database → Create database**.
2. Pick a region close to you (e.g. `asia-south1` for India).
3. In **Rules**, paste the rules below and **Publish**:

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;

      match /addresses/{id} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }

      match /orders/{id} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
    }
  }
}
```

This locks every user's profile, addresses and orders to them only.

## 4. Register the web app + copy keys

1. In **Project settings → Your apps** → **Add app** → **Web** (`</>`).
2. Copy the config object. Your `.env` file should look like:

```env
VITE_FIREBASE_API_KEY=AIza...            # from: apiKey
VITE_FIREBASE_AUTH_DOMAIN=novus-ecom.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=novus-ecom
VITE_FIREBASE_STORAGE_BUCKET=novus-ecom.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abc123
```

3. Restart the dev server so it picks up the new environment:

```bash
pkill -f vite
npm run dev
```

The app detects the keys automatically — the "Firebase isn't connected yet" banner on `/login` disappears.

---

## What lives where

| Feature | Storage |
| --- | --- |
| Google / email‑password login | Firebase Authentication |
| Profile (`name`, `email`, `phone`, `photoURL`) | `users/{uid}` |
| Saved addresses | `users/{uid}/addresses/{id}` |
| Order history | `users/{uid}/orders/{id}` |

The app auto-creates a user profile document on first sign-in (Google details prefill it), and saves addresses/orders into the matching subcollections.

## Troubleshooting

- **Login button does nothing / popup closes** → check `.env` values are pasted *without* quotes, and restart the dev server.
- **"Missing or insufficient permissions"** → your Firestore rules aren't published (step 3).
- **OTP: "argument" error or reCAPTCHA not showing** → the **Phone** provider isn't enabled in Auth → Sign-in method (step 2). On `localhost` the invisible reCAPTCHA works after enabling it; on a custom domain you may need to add it to Firebase's authorised domains.
- **Demo data seems lost** → once connected, the app reads Firebase only; your earlier localStorage demo data stays on this device but is no longer shown.