import { MongoClient } from "mongodb";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
function loadEnv(file: string): void {
  if (!fs.existsSync(file)) return;
  const lines = fs.readFileSync(file, "utf8").split("\n");
  for (const line of lines) {
    const m = line.match(/^\s*([\w.]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
loadEnv(path.join(__dirname, "..", ".env"));

function startupSlug(companyName: string): string {
  return String(companyName || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .replace(/[^a-z0-9-]/g, "");
}

async function run(): Promise<void> {
  const client = new MongoClient(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017");
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || "startupregion8");

  const startups = await db
    .collection("startups")
    .find({}, { projection: { companyName: 1, slug: 1 } })
    .sort({ createdAt: 1 })
    .toArray();

  const seen = new Set<string>();
  let updated = 0;
  for (const s of startups) {
    if (s.slug) {
      seen.add(s.slug as string);
      continue;
    }
    let base = startupSlug(String(s.companyName || "startup")) || "startup";
    let slug = base;
    let i = 2;
    while (seen.has(slug)) {
      slug = `${base}-${i++}`;
    }
    seen.add(slug);
    await db.collection("startups").updateOne({ _id: s._id }, { $set: { slug } });
    updated += 1;
    console.log(`  ${String(s._id)} -> ${slug}`);
  }
  console.log(`Assigned slugs to ${updated} startup(s).`);
  await client.close();
}
run().catch((e) => { console.error(e); process.exit(1); });