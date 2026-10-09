import Link from "next/link";
import { ArrowRight, BookOpen, FileText, Video } from "lucide-react";
import { scriptMedia } from "@/lib/scripts/media";
import type { ScriptType } from "@/lib/types";

const icons: Record<ScriptType, typeof Video> = { longform: Video, shorts: FileText, blog: BookOpen };

export function ScriptsHome() {
  return (
    <div className="scripts-home">
      <header className="page-header scripts-page-header">
        <div>
          <h1>Scripts</h1>
          <p className="page-description">Choose what you’re making.</p>
        </div>
      </header>

      <section className="script-mode-grid" aria-label="Choose a content medium">
        {scriptMedia.map((medium) => {
          const Icon = icons[medium.type];
          return (
            <Link href={`/scripts/${medium.slug}`} className="script-mode-card" key={medium.type}>
              <div className="script-mode-icon"><Icon size={19} strokeWidth={1.6} /></div>
              <div className="script-mode-copy">
                <span className="eyebrow">{medium.title.toUpperCase()}</span>
                <h2>{medium.description}</h2>
              </div>
              <div className="script-mode-footer"><span>Open workspace</span><ArrowRight size={17} /></div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
