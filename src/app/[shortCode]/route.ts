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
    const originalUrl = await redis.get<string>(shortCode);

    if (originalUrl) {
      await redis.expire(shortCode, WEEK_IN_SECONDS);
      return NextResponse.redirect(originalUrl, 302);
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
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await redis.set(shortCode, result.url, {
    ex: WEEK_IN_SECONDS,
  });

  return NextResponse.redirect(result.url, 302);
}
