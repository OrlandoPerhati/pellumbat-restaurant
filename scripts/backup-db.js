// Exports the live D1 database to a timestamped SQL dump in backups/.
// Usage:  npm run backup
//
// Behind the scenes this just calls `wrangler d1 export pellumbat-e-paqes --remote`
// and pipes the output to a file. Wrangler emits a full SQL script that can be
// replayed against an empty D1 (or SQLite) to reconstruct everything: schema +
// every row of every table.
//
// In CI this runs from .github/workflows/backup.yml on a daily cron. Locally you can
// run it any time you want a manual snapshot before a risky change.

const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const DATABASE_NAME = "pellumbat-e-paqes";
const BACKUP_DIR = path.join(__dirname, "..", "backups");

function timestamp() {
  // 2026-05-12T17-04-22 — colon-free so the filename works on Windows too.
  return new Date().toISOString().replace(/[:.]/g, "-").replace("T", "T").slice(0, 19);
}

fs.mkdirSync(BACKUP_DIR, { recursive: true });
const outputFile = path.join(BACKUP_DIR, `${DATABASE_NAME}-${timestamp()}.sql`);

console.log(`Exporting ${DATABASE_NAME} to ${outputFile} ...`);

try {
  // --remote pulls from the live D1, --no-schema=false includes CREATE TABLE statements,
  // --output writes the SQL directly to a file.
  execSync(
    `npx wrangler d1 export ${DATABASE_NAME} --remote --output "${outputFile}"`,
    { stdio: "inherit" },
  );
  const sizeKb = (fs.statSync(outputFile).size / 1024).toFixed(1);
  console.log(`Backup complete: ${outputFile} (${sizeKb} KB)`);
} catch (error) {
  console.error("Backup failed:", error.message);
  process.exit(1);
}
