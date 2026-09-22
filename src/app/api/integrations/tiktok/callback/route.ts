import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { appUrl } from "@/lib/env";
import { stateCookieName, validOAuthState } from "@/lib/integrations/oauth-state";
import { exchangeTikTokCode } from "@/lib/integrations/tiktok/oauth";
import { fetchTikTokStats } from "@/lib/integrations/tiktok/client";
import { saveConnection } from "@/lib/integrations/persist";

export async function GET(request: NextRequest) {
  const auth = await requireUser(); if ("response" in auth) return auth.response;
  const redirect = (result: string) => { const response = NextResponse.redirect(`${appUrl()}/settings?social=${result}`); response.cookies.delete(stateCookieName("tiktok")); return response; };
  if (!validOAuthState(request.cookies.get(stateCookieName("tiktok"))?.value, request.nextUrl.searchParams.get("state"))) return redirect("tiktok_state_error");
  if (request.nextUrl.searchParams.get("error")) return redirect("tiktok_denied");
  const code = request.nextUrl.searchParams.get("code"); if (!code) return redirect("tiktok_error");
  try { const tokens = await exchangeTikTokCode(code); const scopes = tokens.scope?.split(/[ ,]+/).filter(Boolean) ?? []; const stats = await fetchTikTokStats(tokens.accessToken, scopes); await saveConnection(auth.user.id, stats, tokens, scopes, "sandbox"); return redirect("tiktok_connected"); }
  catch { return redirect("tiktok_error"); }
}

