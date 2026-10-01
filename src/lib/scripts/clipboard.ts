export function formatScriptClipboardText(title: string, content: string) {
  const cleanTitle = title.trim();
  if (!cleanTitle) return content;
  if (!content) return cleanTitle;
  return `${cleanTitle}\n\n${content}`;
}
