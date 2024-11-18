import prisma from "@/lib/db";
import { encode } from "@/lib/utils";
import { Redis } from "@upstash/redis";
import { handle } from "hono/vercel";
import { createRoute } from "@hono/zod-openapi";
import {
  LimitsResponseSchema,
  ShortenedUrlErrorSchema,
  ShortenedUrlResponseSchema,
  ShortenedUrlSchema,
} from "@/lib/schemas";
import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { WEEK_IN_SECONDS } from "@/lib/constants";
import { Ratelimit } from "@upstash/ratelimit";

const redis = Redis.fromEnv();

const postUrlRoute = createRoute({
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
    429: {
      content: {
        "application/json": {
          schema: ShortenedUrlErrorSchema,
        },
      },
      description: "Rate limit exceeded",
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

const getLimitsRoute = createRoute({
  method: "get",
  path: "/limits",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: LimitsResponseSchema,
        },
      },
      description: "Retrieve the limits for the given IP",
    },
  },
});

const app = new OpenAPIHono()
  .basePath("/api")
  .openapi(postUrlRoute, async (c) => {
    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "86400 s"),
    });

    const ip = c.req.header("x-forwarded-for") ?? "127.0.0.1";

    const { success } = await ratelimit.limit(ip);

    if (!success) {
      return c.json(
        {
          error:
            "Your daily rate limit has exceeded. Please try again tomorrow.",
        },
        429
      );
    }

    const { url, expiresAt } = c.req.valid("json");

    const currentCount = await redis.incr("globalCount");
    const shortCode = encode(currentCount);

    try {
      const result = await prisma.url.create({
        data: {
          shortCode,
          expiresAt:
            expiresAt ?? new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
          url,
        },
      });

      const ttl = Math.min(
        new Date(result.expiresAt).getTime() - Date.now() / 1000,
        WEEK_IN_SECONDS
      );

      await redis.set(
        shortCode,
        JSON.stringify({
          url: result.url,
          expiresAt: result.expiresAt,
        }),
        {
          ex: ttl,
        }
      );
    } catch (error) {
      return c.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Failed to create short URL",
        },
        500
      );
    }

    return c.json({ shortCode }, 200);
  })
  .openapi(getLimitsRoute, async (c) => {
    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "86400 s"),
    });

    const ip = c.req.header("x-forwarded-for") ?? "127.0.0.1";

    const { remaining } = await ratelimit.getRemaining(ip);

    return c.json({ remaining }, 200);
  })
  .doc("/documentation", {
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "URL Shortener API Documentation",
    },
  })
  .get("/ui", swaggerUI({ url: "/api/documentation" }));

export const GET = handle(app);
export const POST = handle(app);

export type AppType = typeof app;
