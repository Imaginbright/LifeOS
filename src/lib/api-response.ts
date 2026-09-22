import { NextResponse } from "next/server";

export const badRequest = (message: string) => NextResponse.json({ error: message }, { status: 400 });
export const serverError = (error: unknown) => {
  console.error(error instanceof Error ? error.message : "Unexpected server error");
  return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
};

export async function jsonBody(request: Request) {
  try { return await request.json() as Record<string, unknown>; }
  catch { return null; }
}

export const cleanText = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";

