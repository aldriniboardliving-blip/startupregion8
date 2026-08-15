import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const dbName = process.env.MONGODB_DB || "startupregion8";

const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;
let indexesReady = false;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  const db = client.db(dbName);
  if (!indexesReady) {
    indexesReady = true;
    await ensureIndexes(db).catch(() => {});
  }
  return db;
}

export const collections = {
  startups: "startups",
  founders: "founders",
  fundings: "fundings",
  news: "news",
  blogs: "blogs",
  carousel: "carousel_items",
  government: "government_pages",
  visits: "analytics_visits",
} as const;

export async function ensureIndexes(db: Db): Promise<void> {
  Promise.all([
    db.collection(collections.news).createIndex({ slug: 1 }, { unique: true }),
    db.collection(collections.blogs).createIndex({ slug: 1 }, { unique: true }),
    db.collection(collections.government).createIndex({ slug: 1 }, { unique: true }),
    db.collection(collections.founders).createIndex({ startupId: 1 }),
    db.collection(collections.fundings).createIndex({ startupId: 1 }),
    db.collection(collections.startups).createIndex({ province: 1 }),
    db.collection(collections.startups).createIndex({ slug: 1 }, { unique: true, sparse: true }),
    db.collection(collections.visits).createIndex({ visitorId: 1, visitedAt: -1 }),
    db.collection(collections.visits).createIndex({ path: 1 }),
  ]);
}
