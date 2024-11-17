import { z } from "@hono/zod-openapi";

export const ShortenedUrlSchema = z.object({
  url: z
    .string()
    .url()
    .openapi({
      param: {
        name: "url",
        in: "query",
        required: true,
      },
      example: "https://shortnsweet.vercel.app",
    }),
  expiresAt: z.coerce
    .date()
    .optional()
    .openapi({
      param: {
        name: "expiresAt",
        in: "query",
        required: false,
      },
      example: "2022-01-01T00:00:00Z",
    }),
});

export const LimitsResponseSchema = z
  .object({
    remaining: z.number().openapi({
      example: 2,
    }),
  })
  .openapi("Limit Response");

export const ShortenedUrlErrorSchema = z
  .object({
    error: z.string().openapi({
      example: "Failed to create short URL",
    }),
  })
  .openapi("Error Response");

export const ShortenedUrlResponseSchema = z
  .object({
    shortCode: z.string().openapi({
      example: "abc123",
    }),
  })
  .openapi("Shortened URL Response");
