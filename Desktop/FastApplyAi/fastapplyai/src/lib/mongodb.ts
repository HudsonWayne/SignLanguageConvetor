// src/lib/mongodb.ts
import { MongoClient, Db } from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var _mongo: { client: MongoClient; db: Db } | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI!;
const MONGODB_DB = "fastapplyai";

if (!MONGODB_URI) throw new Error("Please define MONGODB_URI in .env");

export async function getMongo() {
  if (global._mongo) return global._mongo;

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(MONGODB_DB);

  global._mongo = { client, db };
  return global._mongo;
}
