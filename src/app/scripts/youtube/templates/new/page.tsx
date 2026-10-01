import type { Metadata } from "next";
import { ScriptTemplateForm } from "@/components/scripts/script-template-form";

export const metadata: Metadata = { title: "New YouTube template" };
export default function NewYouTubeTemplatePage() { return <ScriptTemplateForm initialType="longform" />; }
