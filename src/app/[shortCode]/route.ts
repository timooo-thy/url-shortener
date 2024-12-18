import { RESERVED_PATHS, WEEK_IN_SECONDS } from "@/lib/constants";
import prisma from "@/lib/db";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const redis = Redis.fromEnv();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  const { shortCode } = await params;

  if (RESERVED_PATHS.includes(shortCode)) {
    return NextResponse.next();
  }

  if (await redis.exists(shortCode)) {
    const cachedData = await redis.get<{ url: string; expiresAt: string }>(
      shortCode
    );

    if (cachedData) {
      const { url, expiresAt } = cachedData;

      if (new Date(expiresAt) < new Date()) {
        await redis.del(shortCode);
        return NextResponse.json(
          { error: "Short code has expired" },
          { status: 404 }
        );
      }

      const ttl = Math.min(
        (new Date(expiresAt).getTime() - Date.now()) / 1000,
        WEEK_IN_SECONDS
      );

      if (url) {
        await redis.expire(shortCode, Math.floor(ttl));
        return NextResponse.redirect(url, 302);
      }
    }
  }

  const result = await prisma.url.findUnique({
    where: {
      shortCode,
    },
    select: {
      url: true,
      expiresAt: true,
    },
  });

  if (result && new Date(result.expiresAt) < new Date()) {
    return NextResponse.json(
      { error: "Short code has expired" },
      { status: 404 }
    );
  }

  if (!result) {
    return NextResponse.json({ error: "Url not found" }, { status: 404 });
  }

  const ttl = Math.min(
    new Date(result.expiresAt).getTime() - Date.now() / 1000,
    WEEK_IN_SECONDS
  );

  await redis.set(
    shortCode,
    { url: result.url, expiresAt: result.expiresAt },
    {
      ex: Math.floor(ttl),
    }
  );

  return NextResponse.redirect(result.url, 302);
}
