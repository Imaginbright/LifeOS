import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { appUrl } from "@/lib/env";
import { createOAuthState, oauthCookieOptions, stateCookieName } from "@/lib/integrations/oauth-state";
import { instagramAuthorizationUrl } from "@/lib/integrations/instagram/oauth";

export async function GET() {
  const auth = await requireUser(); if ("response" in auth) return auth.response;
  try { const state = createOAuthState(); const response = NextResponse.redirect(instagramAuthorizationUrl(state)); response.cookies.set(stateCookieName("instagram"), state, oauthCookieOptions()); return response; }
  catch { return NextResponse.redirect(`${appUrl()}/settings?social=instagram_config`); }
}
