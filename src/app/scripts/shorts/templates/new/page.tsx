import type { Metadata } from "next";
import { ScriptTemplateForm } from "@/components/scripts/script-template-form";

export const metadata: Metadata = { title: "New Shorts template" };
export default function NewShortsTemplatePage() { return <ScriptTemplateForm initialType="shorts" />; }
