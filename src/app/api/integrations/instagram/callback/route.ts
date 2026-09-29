import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { appUrl } from "@/lib/env";
import { stateCookieName, validOAuthState } from "@/lib/integrations/oauth-state";
import { exchangeInstagramCode, instagramScope } from "@/lib/integrations/instagram/oauth";
import { fetchInstagramStats } from "@/lib/integrations/instagram/client";
import { saveConnection } from "@/lib/integrations/persist";

export async function GET(request: NextRequest) {
  const auth = await requireUser(); if ("response" in auth) return auth.response;
  const redirect = (result: string) => { const response = NextResponse.redirect(`${appUrl()}/settings?social=${result}`); response.cookies.delete(stateCookieName("instagram")); return response; };
  if (!validOAuthState(request.cookies.get(stateCookieName("instagram"))?.value, request.nextUrl.searchParams.get("state"))) return redirect("instagram_state_error");
  if (request.nextUrl.searchParams.get("error")) return redirect("instagram_denied");
  const code = request.nextUrl.searchParams.get("code"); if (!code) return redirect("instagram_error");
  try { const tokens = await exchangeInstagramCode(code); const stats = await fetchInstagramStats(tokens.accessToken); await saveConnection(auth.user.id, stats, tokens, [instagramScope], "production"); return redirect("instagram_connected"); }
  catch { return redirect("instagram_error"); }
}
