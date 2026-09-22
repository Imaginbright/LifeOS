import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createOAuthState, oauthCookieOptions, stateCookieName } from "@/lib/integrations/oauth-state";
import { youtubeAuthorizationUrl } from "@/lib/integrations/youtube/oauth";

export async function GET() {
  const auth = await requireUser(); if ("response" in auth) return auth.response;
  try { const state = createOAuthState(); const response = NextResponse.redirect(youtubeAuthorizationUrl(state)); response.cookies.set(stateCookieName("youtube"), state, oauthCookieOptions()); return response; }
  catch { return NextResponse.redirect(new URL("/settings?social=youtube_config", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000")); }
}

