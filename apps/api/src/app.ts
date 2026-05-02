import { Hono } from "hono";
import { cors } from "hono/cors";
import { users } from "./routes/users.js";
import { cases } from "./routes/cases.js";
import { notes } from "./routes/notes.js";
import { sessions } from "./routes/sessions.js";
import { tools } from "./routes/tools.js";
import { internal } from "./routes/internal.js";
import { caseStream } from "./routes/case-stream.js";

export const app = new Hono()
  .use(cors())
  .get("/health", (c) => c.json({ status: "ok" }))
  .route("/users", users)
  .route("/cases", cases)
  .route("/notes", notes)
  .route("/sessions", sessions)
  .route("/tools", tools)
  .route("/_internal", internal)
  .route("/case-stream", caseStream);
