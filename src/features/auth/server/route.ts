import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

const app = new Hono()
  .get("/", (c) => {
    return c.json({
      message: "Hello this is the auth page!",
    });
  })
  .post(
    "/posts",
    zValidator(
      "form",
      z.object({
        title: z.string(),
        body: z.string(),
      })
    ),
    (c) => {
      return c.json(
        {
          ok: true,
          message: "Created!",
        },
        201
      );
    }
  );

export default app;
