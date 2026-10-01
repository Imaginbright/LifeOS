import type { Metadata } from "next";
import { ScriptMediumPage } from "@/components/scripts/script-medium-page";

export const metadata: Metadata = { title: "Blog" };
export default function BlogPage() { return <ScriptMediumPage type="blog" />; }
