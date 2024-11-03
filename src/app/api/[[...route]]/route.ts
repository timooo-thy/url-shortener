import { Hono } from "hono";
import { handle } from "hono/vercel";
import auth from "@/features/auth/server/route";

export const runtime = "edge";

const app = new Hono()
  .basePath("/api")
  .get("/", (c) => {
    return c.json({
      message: "Hello Next.js!",
    });
  })
  .route("/auth", auth);

export const GET = handle(app);
export const POST = handle(app);

export type AppType = typeof app;
