import { NextResponse } from "next/server";
import { getRandomManga } from "@/lib/mangadex";

export async function GET() {
  const randomId = await getRandomManga();
  if (randomId) {
    return NextResponse.redirect(new URL(`/title/${randomId}`, process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"));
  }
  return NextResponse.redirect(new URL("/browse", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"));
}
