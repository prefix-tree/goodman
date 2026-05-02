import { serve } from "@hono/node-server";
import { app } from "./app.js";
import { connectDb } from "./db.js";
import { applySchema } from "./schema.js";

const port = Number(process.env.PORT) || 3001;

await connectDb();
await applySchema();

const hostname = process.env.HOST || "0.0.0.0";

serve({ fetch: app.fetch, port, hostname }, (info) => {
  console.log(`API running on http://${info.address}:${info.port}`);
});
