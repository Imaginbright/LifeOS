import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ScriptEditor } from "@/components/scripts/script-editor";
import { isStaleScriptDraft, scriptManuscriptFromStoredContent } from "@/lib/scripts/templates";
import { createClient } from "@/lib/supabase/server";
import type { ScriptType } from "@/lib/types";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { title: "Script" };
  const { data } = await supabase.from("scripts").select("title").eq("id", id).eq("user_id", user.id).maybeSingle();
  return { title: data?.title ?? "Script" };
}

export default async function ScriptPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();
  const { data, error } = await supabase
    .from("scripts")
    .select("id,title,type,content")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data || isStaleScriptDraft(data.title) || !["longform", "shorts", "blog"].includes(data.type)) notFound();
  return (
    <ScriptEditor
      id={data.id}
      initialTitle={data.title}
      initialContent={scriptManuscriptFromStoredContent(data.content)}
      type={data.type as ScriptType}
    />
  );
}
