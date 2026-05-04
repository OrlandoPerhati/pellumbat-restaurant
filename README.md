# Pellumbat e Paqes Website

A functional wedding, events, bar, and restaurant website with a small Node server, admin page, bilingual Albanian/English UI, reservation requests, customer cancellation codes, and editable menu data.

## Run Locally

Open this folder in Visual Studio Code:

```text
C:\Users\orlan\OneDrive\Documents\New project\restaurant-website
```

Then run:

```bash
npm start
```

Visit:

- Website: `http://127.0.0.1:8000/`
- Admin: `http://127.0.0.1:8000/admin.html`
- Health check: `http://127.0.0.1:8000/api/health`

If port 8000 is busy:

```powershell
$env:PORT=8001; npm start
```

## Admin

For local learning only, the admin password is:

```text
admin
```

Before deployment, set a real password with an environment variable. In production mode, the server will refuse to start if the password is still `admin`.

```powershell
$env:ADMIN_PASSWORD="your-strong-password"; npm start
```

The admin page can:

- View and filter reservations.
- Update reservation status.
- Mark reservations as canceled.
- Permanently delete reservations with a themed in-page confirmation modal.
- Add menu items.
- Toggle menu items on or off.
- Delete menu items.

Refreshing or closing the admin tab logs you out because the admin session is stored only in page memory.

## Current Content Status

The site now includes:

- Wedding, events, bar, and restaurant positioning.
- Contact and WhatsApp: `+355 686264646`.
- Address: `Pellumbat e Paqes, Rruga e Arberit 1, Tirane, Albania`.
- 19 years of experience.
- Free parking.
- Temporary menu placeholders until the real menu and prices are ready.

## Deployment Prep

Use these environment variables on the hosting provider:

```text
NODE_ENV=production
HOST=0.0.0.0
PORT=<provided-by-host>
ADMIN_PASSWORD=<strong-private-password>
DATA_DIR=<optional-persistent-folder>
```

`DATA_DIR` is optional locally, but important on many hosts. If the host's filesystem resets on every deploy, reservations saved to JSON will disappear unless `DATA_DIR` points to persistent storage.

## Recommended Hosts

Good beginner-friendly options:

- Render: simple Node web service, supports persistent disks on paid plans.
- Railway: quick Node deploys, easy environment variables.
- VPS: most control, more setup work.

For Vercel-style static hosting, this project would need changes because it uses a long-running Node server and local JSON files.

## Database

The current JSON storage is fine while you are learning and collecting final content. For a real public site, move reservations and menu data to SQLite, Supabase, Postgres, Firebase, or another database before relying on it for important customer bookings.

## Checks

Run:

```bash
npm run check
```

That checks the syntax of the server, public JavaScript, and admin JavaScript.
