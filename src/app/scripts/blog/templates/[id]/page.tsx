import type { Metadata } from "next";
import { ScriptTemplateRoute } from "@/components/scripts/script-template-route";

type PageProps = { params: Promise<{ id: string }> };
export const metadata: Metadata = { title: "Template" };
export default async function BlogTemplatePage({ params }: PageProps) {
  const { id } = await params;
  return <ScriptTemplateRoute id={id} type="blog" />;
}
