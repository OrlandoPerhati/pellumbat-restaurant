# Deploying to Cloudflare (free tier)

This site runs on three free Cloudflare products:

- **Pages** — static `index.html` / `admin.html` / CSS / JS / images
- **Pages Functions** — the `/api/*` routes in `functions/`
- **D1** — SQLite database for menu, reservations, and admin sessions

You only pay for the custom domain (registered through Cloudflare Registrar at cost, or any other registrar).

---

## One-time setup

### 1. Install dependencies

```bash
cd restaurant-website
npm install
```

This installs Wrangler (Cloudflare's CLI). No production dependencies are added.

### 2. Log in to Cloudflare

```bash
npx wrangler login
```

A browser window opens — approve access for your Cloudflare account.

### 3. Create the D1 database

```bash
npm run db:create
```

The output will look like:

```
[[d1_databases]]
binding = "DB"
database_name = "pellumbat-e-paqes"
database_id = "abc123-..."
```

Copy that `database_id` and paste it into `wrangler.toml`, replacing `REPLACE_WITH_YOUR_D1_DATABASE_ID`.

### 4. Apply the schema and seed the menu (remote)

```bash
npm run db:schema:remote
npm run db:seed:remote
```

### 5. Set the admin password as a secret

```bash
npx wrangler pages secret put ADMIN_PASSWORD --project-name=pellumbat-e-paqes
```

Wrangler will prompt for the value. Use something strong — this is the only thing protecting the admin dashboard.

> The first deploy creates the project, so if Wrangler complains about the project not existing yet, run step 6 first and then come back to step 5.

### 6. Deploy

```bash
npm run deploy
```

The first time, Wrangler asks you to confirm the project name (`pellumbat-e-paqes`) and the production branch. After that, every deploy gives you a URL like `https://pellumbat-e-paqes.pages.dev`.

---

## Local development

```bash
cp .dev.vars.example .dev.vars   # then edit .dev.vars and set a password
npm run db:schema:local
npm run db:seed:local
npm run dev
```

`wrangler pages dev` serves the static files **and** the Pages Functions, with a local D1 instance, at `http://127.0.0.1:8788`.

---

## Connecting your custom domain

1. In the Cloudflare dashboard: **Pages → pellumbat-e-paqes → Custom domains → Set up a custom domain**.
2. Enter the domain (e.g. `pellumbatepaqes.com`).
3. If the domain is registered through Cloudflare, DNS is configured automatically. Otherwise, follow the CNAME instructions Wrangler shows you.
4. HTTPS is provisioned automatically within a few minutes.

---

## Updating the site after launch

```bash
npm run deploy
```

Schema changes (rare) need:

```bash
npm run db:schema:remote
```

Rotate the admin password:

```bash
npx wrangler pages secret put ADMIN_PASSWORD --project-name=pellumbat-e-paqes
```

---

## Free tier limits (more than enough for a restaurant)

- **Pages**: unlimited bandwidth, 500 builds/month
- **Pages Functions**: 100,000 invocations/day
- **D1**: 5 GB storage, 5 million reads/day, 100,000 writes/day

If a single page view triggers ~3 API calls (menu, availability, etc.), you can serve roughly 30,000 visitors per day for free.

---

## Legacy local Node server

`server.js` is the original Node HTTP server kept for offline development without Cloudflare tooling. It is **not** used in production. Run it with `npm start` and visit `http://127.0.0.1:8000/`. It uses JSON files in `data/` instead of D1.
