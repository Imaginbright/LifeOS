import "server-only";

import { randomBytes } from "node:crypto";
export { validOAuthState } from "./oauth-state-utils";

export const stateCookieName = (provider: "youtube" | "tiktok") => `lifeos_${provider}_oauth_state`;
export const createOAuthState = () => randomBytes(32).toString("base64url");
export const oauthCookieOptions = () => ({ httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: 600 });

