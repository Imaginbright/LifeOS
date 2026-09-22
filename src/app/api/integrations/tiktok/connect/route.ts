import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { appUrl } from "@/lib/env";
import { createOAuthState, oauthCookieOptions, stateCookieName } from "@/lib/integrations/oauth-state";
import { tiktokAuthorizationUrl } from "@/lib/integrations/tiktok/oauth";

export async function GET() {
  const auth = await requireUser(); if ("response" in auth) return auth.response;
  try { const state = createOAuthState(); const response = NextResponse.redirect(tiktokAuthorizationUrl(state)); response.cookies.set(stateCookieName("tiktok"), state, oauthCookieOptions()); return response; }
  catch { return NextResponse.redirect(`${appUrl()}/settings?social=tiktok_https_required`); }
}

