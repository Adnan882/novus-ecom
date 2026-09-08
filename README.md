# Novus — E-commerce Store

React + Vite storefront with Firebase auth, Firestore orders/invoices, and a printable GST bill flow.

## Quick start

```bash
cp .env.example .env   # then fill in your real Firebase keys
npm install
npm run dev            # http://localhost:5173
```

- `.env` is gitignored. Commit only `.env.example` (the safe template). Never add secrets elsewhere.
- Firebase setup (services, providers, Firestore rules) is documented in `FIREBASE_SETUP.md`.

## Build

```bash
npm run build          # outputs to dist/
```

## Deploy (Vercel)

The site deploys to `https://novus-ecom.vercel.app` (project `novus-ecom`, scope `adnan882s-projects`).

`.vercel/` is gitignored (per-machine link metadata), so on a fresh machine link once, then deploy:

```bash
# 1. Link (creates .vercel/ locally — do this once per machine)
npx -y vercel@latest link --yes --project novus-ecom --scope adnan882s-projects

# 2. Add the production env vars (from .env) if not already present
npx -y vercel@latest env add VITE_FIREBASE_API_KEY production --token "$VERCEL_TOKEN"
# ... repeat for VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID,
#     VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID,
#     VITE_FIREBASE_APP_ID

# 3. Deploy (pass your token via $VERCEL_TOKEN)
npx -y vercel@latest deploy --prod --yes --token "$VERCEL_TOKEN"
```

- SPA rewrites are configured in `vercel.json` (all non-asset paths → `index.html`).
- Login as a Vercel user with access to the `novus-ecom` project already linked.