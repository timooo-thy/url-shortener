import { RESERVED_PATHS } from "@/lib/constants";
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
      return NextResponse.redirect(originalUrl, 302);
    }
  }

  const result = await prisma.url.findUnique({
    where: {
      shortCode,
    },
    select: {
      url: true,
    },
  });

  if (!result) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await redis.set(shortCode, result.url);

  return NextResponse.redirect(result.url, 302);
}
