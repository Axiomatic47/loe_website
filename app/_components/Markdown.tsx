// app/_components/Markdown.tsx — the `Md` the byte-identical research modules import ('../../_components/Markdown',
// exporting Md({children, inline})): inline markdown for a sentence (italic case names, bold, code) and block markdown
// for short prose (paragraphs, links, footnote refs via remark-gfm). This is lawsofexistence.com's rendering of that
// contract on its own tokens; the modules that import it (app/research/immunity-timeline/*) are shared across the
// sites unchanged, so the export's name and props stay as they are.
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MdProps {
  children: string;
  inline?: boolean;
}

export function Md({ children, inline = false }: MdProps) {
  if (inline) {
    return (
      <span className="[&_p]:inline">
        <ReactMarkdown allowedElements={['p', 'em', 'strong', 'code']} unwrapDisallowed>{children}</ReactMarkdown>
      </span>
    );
  }
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ href, children, ...rest }) => (
          <a href={href} {...rest} className="underline underline-offset-2 text-primary hover:text-foreground">{children}</a>
        ),
        code: ({ children }) => <code className="font-mono text-[0.9em] bg-secondary px-1 rounded">{children}</code>,
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
