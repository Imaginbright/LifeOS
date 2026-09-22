import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { appUrl } from "@/lib/env";
import { stateCookieName, validOAuthState } from "@/lib/integrations/oauth-state";
import { exchangeYouTubeCode } from "@/lib/integrations/youtube/oauth";
import { fetchYouTubeStats } from "@/lib/integrations/youtube/client";
import { saveConnection } from "@/lib/integrations/persist";

export async function GET(request: NextRequest) {
  const auth = await requireUser(); if ("response" in auth) return auth.response;
  const redirect = (result: string) => { const response = NextResponse.redirect(`${appUrl()}/settings?social=${result}`); response.cookies.delete(stateCookieName("youtube")); return response; };
  if (!validOAuthState(request.cookies.get(stateCookieName("youtube"))?.value, request.nextUrl.searchParams.get("state"))) return redirect("youtube_state_error");
  if (request.nextUrl.searchParams.get("error")) return redirect("youtube_denied");
  const code = request.nextUrl.searchParams.get("code"); if (!code) return redirect("youtube_error");
  try { const tokens = await exchangeYouTubeCode(code); const stats = await fetchYouTubeStats(tokens.accessToken); await saveConnection(auth.user.id, stats, tokens, tokens.scope?.split(" ").filter(Boolean) ?? ["https://www.googleapis.com/auth/youtube.readonly"], "production"); return redirect("youtube_connected"); }
  catch { return redirect("youtube_error"); }
}

