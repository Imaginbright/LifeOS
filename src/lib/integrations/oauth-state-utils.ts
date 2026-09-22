import { timingSafeEqual } from "node:crypto";

export function validOAuthState(expected: string | undefined, actual: string | null) {
  if (!expected || !actual) return false;
  const left = Buffer.from(expected); const right = Buffer.from(actual);
  return left.length === right.length && timingSafeEqual(left, right);
}
