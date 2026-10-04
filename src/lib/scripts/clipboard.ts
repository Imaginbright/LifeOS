import { videoScriptManuscript, type VideoScriptSection } from "./templates";
import type { ScriptType } from "../types";

export function formatScriptClipboardText(title: string, content: string) {
  const cleanTitle = title.trim();
  if (!cleanTitle) return content;
  if (!content) return cleanTitle;
  return `${cleanTitle}\n\n${content}`;
}

export function formatVideoScriptClipboardText(title: string, sections: VideoScriptSection[]) {
  return formatScriptClipboardText(title, videoScriptManuscript(sections));
}

export function formatBlogMdxClipboardText(source: string) {
  return source;
}

export function scriptClipboardText(type: ScriptType, title: string, rawContent: string, sections: VideoScriptSection[]) {
  return type === "blog" ? formatBlogMdxClipboardText(rawContent) : formatVideoScriptClipboardText(title, sections);
}
