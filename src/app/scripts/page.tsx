import type { Metadata } from "next";
import { ScriptsHome } from "@/components/scripts/scripts-home";

export const metadata: Metadata = { title: "Scripts" };

export default function ScriptsPage() {
  return <ScriptsHome />;
}
