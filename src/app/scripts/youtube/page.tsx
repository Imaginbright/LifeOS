import type { Metadata } from "next";
import { ScriptMediumPage } from "@/components/scripts/script-medium-page";

export const metadata: Metadata = { title: "YouTube scripts" };
export default function YouTubeScriptsPage() { return <ScriptMediumPage type="longform" />; }
