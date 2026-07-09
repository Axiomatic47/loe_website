// src/components/StacMarkdown.tsx — renderer for the STAC working documents.
//
// Renders the diplomatic-transcription markdown through react-markdown (GFM),
// and turns inline-code crop references (e.g. `crop_s9p_b1`) into clickable
// chips that open the published crop image in a lightbox — the linkage between
// prose, tiles, and membranes the review workflow depends on. Crop tokens with
// no published image render as plain code (tooltip explains why).

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { STAC_BASE } from "@/pages/StacArchive";

const CROP_TOKEN = /^(?:crops\/)?(?:[a-z0-9_]+\/)*?(crop_[A-Za-z0-9_.]+?)(?:\.jpe?g)?$/i;

interface StacMarkdownProps {
  text: string;
  cropIndex: Record<string, string>;
}

export const StacMarkdown: React.FC<StacMarkdownProps> = ({ text, cropIndex }) => {
  const [lightbox, setLightbox] = useState<{ src: string; name: string } | null>(null);

  const components = {
    code(props: any) {
      const { children, className } = props;
      const raw = String(children).trim();
      // block code (has language class or newlines) → leave alone
      if (className || raw.includes("\n")) {
        return <code className={className}>{children}</code>;
      }
      const m = raw.match(CROP_TOKEN);
      const key = m ? m[1].replace(/\.jpe?g$/i, "") : null;
      if (key && cropIndex[key]) {
        return (
          <button
            type="button"
            onClick={() => setLightbox({ src: `${STAC_BASE}/${cropIndex[key]}`, name: key })}
            className="inline-flex items-center px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/30 text-[0.85em] font-mono hover:bg-primary/20 transition-colors align-baseline"
            title={`View crop ${key}`}
          >
            {raw}
          </button>
        );
      }
      return (
        <code title={key ? "crop not published on the site yet" : undefined}>{children}</code>
      );
    },
  };

  return (
    <>
      <div className="prose max-w-none [&_blockquote]:not-italic [&_blockquote]:text-foreground/90">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
          {text}
        </ReactMarkdown>
      </div>

      {/* crop lightbox — intentionally bg-black/90 per DESIGN.md (image viewing) */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-6 cursor-zoom-out"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-label={`Crop ${lightbox.name}`}
        >
          <img
            src={lightbox.src}
            alt={lightbox.name}
            className="max-h-[86vh] max-w-full object-contain rounded shadow-md"
          />
          <div className="mt-3 text-sm text-white/85 font-mono">{lightbox.name} — click to close</div>
        </div>
      )}
    </>
  );
};

export default StacMarkdown;
