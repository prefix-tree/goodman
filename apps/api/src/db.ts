import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI environment variable is not set");
}

const client = new MongoClient(uri);

let db: Db;

export async function connectDb(): Promise<Db> {
  if (!db) {
    await client.connect();
    db = client.db();
    console.log("Connected to MongoDB Atlas");
  }
  return db;
}

export function getDb(): Db {
  if (!db) {
    throw new Error("Database not connected. Call connectDb() first.");
  }
  return db;
}

export { client };
