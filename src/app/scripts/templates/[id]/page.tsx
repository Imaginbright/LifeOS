import { redirect } from "next/navigation";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { scriptMediaForType } from "@/lib/scripts/media";
import type { ScriptType } from "@/lib/types";

type PageProps = { params: Promise<{ id: string }> };

export default async function LegacyTemplatePage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/scripts/templates/${id}`)}`);
  const { data } = await supabase.from("script_templates").select("id,type").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (!data || !["longform", "shorts", "blog"].includes(data.type)) redirect("/scripts");
  redirect(`/scripts/${scriptMediaForType(data.type as ScriptType).slug}/templates/${data.id}`);
}
