import type { Metadata } from "next";
import { ScriptTemplateForm } from "@/components/scripts/script-template-form";

export const metadata: Metadata = { title: "New Blog template" };
export default function NewBlogTemplatePage() { return <ScriptTemplateForm initialType="blog" />; }
