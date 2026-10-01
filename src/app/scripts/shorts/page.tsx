import type { Metadata } from "next";
import { ScriptMediumPage } from "@/components/scripts/script-medium-page";

export const metadata: Metadata = { title: "Shorts" };
export default function ShortsPage() { return <ScriptMediumPage type="shorts" />; }
