// Converts every PNG inside public/assets/ into a sibling .webp file.
// Run with: node scripts/convert-images.js
// Re-run safe: existing .webp outputs are overwritten.

const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");

const ASSETS_DIR = path.join(__dirname, "..", "public", "assets");

async function* walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(fullPath);
    } else if (entry.isFile() && /\.png$/i.test(entry.name)) {
      yield fullPath;
    }
  }
}

(async () => {
  let savedBytes = 0;
  let count = 0;
  for await (const png of walk(ASSETS_DIR)) {
    const webp = png.replace(/\.png$/i, ".webp");
    const before = (await fs.stat(png)).size;
    await sharp(png).webp({ quality: 82, effort: 6 }).toFile(webp);
    const after = (await fs.stat(webp)).size;
    const saved = before - after;
    savedBytes += saved;
    count += 1;
    const percent = ((saved / before) * 100).toFixed(0);
    console.log(`${path.relative(ASSETS_DIR, png).padEnd(40)} ${(before / 1024).toFixed(0).padStart(6)} KB -> ${(after / 1024).toFixed(0).padStart(5)} KB  (-${percent}%)`);
  }
  console.log(`\nConverted ${count} files. Total saved: ${(savedBytes / 1024 / 1024).toFixed(2)} MB`);
})();
