import prisma from "@/lib/db";
import { encode } from "@/lib/utils";
import { Redis } from "@upstash/redis";
import { handle } from "hono/vercel";
import { createRoute } from "@hono/zod-openapi";
import {
  ShortenedUrlErrorSchema,
  ShortenedUrlResponseSchema,
  ShortenedUrlSchema,
} from "@/lib/schemas";
import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { WEEK_IN_SECONDS } from "@/lib/constants";

const redis = Redis.fromEnv();

const route = createRoute({
  method: "post",
  path: "/shortenUrl",
  request: {
    body: {
      content: {
        "application/json": {
          schema: ShortenedUrlSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: ShortenedUrlResponseSchema,
        },
      },
      description: "Shortened URL",
    },
    500: {
      content: {
        "application/json": {
          schema: ShortenedUrlErrorSchema,
        },
      },
      description: "Internal Server Error",
    },
  },
});

const app = new OpenAPIHono()
  .basePath("/api")
  .openapi(route, async (c) => {
    const { url, expiresAt } = c.req.valid("json");

    const currentCount = await redis.incr("globalCount");
    const shortCode = encode(currentCount);

    try {
      await prisma.url.create({
        data: {
          shortCode,
          expiresAt:
            expiresAt ?? new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
          url,
        },
      });

      await redis.set(shortCode, url, {
        ex: WEEK_IN_SECONDS,
      });
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ error: error.message }, 500);
      } else {
        return c.json({ error: "Failed to create short URL" }, 500);
      }
    }

    return c.json({ shortCode }, 200);
  })
  .doc("/documentation", {
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "URL Shortener API Documentation",
    },
  })
  .get("/doc", swaggerUI({ url: "/api/documentation" }));

export const GET = handle(app);
export const POST = handle(app);

export type AppType = typeof app;
