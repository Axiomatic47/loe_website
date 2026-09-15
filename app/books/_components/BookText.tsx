// app/books/_components/BookText.tsx — a reviewed book's text (markdown with
// GFM footnotes) in the site's reading type. The import writes every
// citation unit in the notes as a link `[unit](cite:<note>/<seq>)`; this
// renderer turns a `cite:` href into an anchor carrying data-cite, which the
// review pane's click handler reads. Server component: react-markdown over
// 800 KB of text is a build-time cost, not a visitor's.
import ReactMarkdown, { defaultUrlTransform } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

export const CITE_SCHEME = 'cite:';
// react-markdown drops hrefs whose scheme it does not know before the `a`
// renderer sees them; `cite:` passes, everything else takes the default guard
const urlTransform = (url: string) => (url.startsWith(CITE_SCHEME) ? url : defaultUrlTransform(url));

interface Props {
  children: string;
  /** where a `cite:` link points: the review route (from the text page) or
      '' on the review page itself, where the hash alone selects the cited page */
  citeBase?: string;
  /** no card chrome — the caller supplies the card (the review pane) */
  bare?: boolean;
}

export function BookText({ children, citeBase = '', bare = false }: Props) {
  return (
    <article
      className={cn(
        bare ? 'px-6 py-6 sm:px-8' : 'rounded-lg border border-border bg-card shadow-sm px-6 py-8 sm:px-10 sm:py-10',
        'font-serif text-[1.05rem] leading-relaxed text-foreground/90 max-w-none',
        '[&>*:first-child]:mt-0',
        '[&_h1]:font-serif [&_h1]:text-3xl [&_h1]:leading-tight [&_h1]:mt-10 [&_h1]:mb-4 [&_h1]:text-foreground',
        '[&_h2]:font-serif [&_h2]:text-2xl [&_h2]:leading-snug [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:pb-2 [&_h2]:border-b [&_h2]:border-border [&_h2]:text-foreground',
        '[&_h3]:font-serif [&_h3]:text-xl [&_h3]:mt-8 [&_h3]:mb-2 [&_h3]:text-foreground',
        '[&_h4]:font-sans [&_h4]:text-xs [&_h4]:uppercase [&_h4]:tracking-[0.12em] [&_h4]:text-primary [&_h4]:mt-6 [&_h4]:mb-2',
        '[&_p]:my-4 [&_ul]:my-4 [&_ol]:my-4 [&_ul]:pl-6 [&_ol]:pl-6 [&_ul]:list-disc [&_ol]:list-decimal [&_li]:my-1.5',
        '[&_blockquote]:border-l-2 [&_blockquote]:border-primary/60 [&_blockquote]:pl-5 [&_blockquote]:my-6 [&_blockquote]:text-muted-foreground [&_blockquote]:italic',
        '[&_hr]:my-10 [&_hr]:border-border',
        '[&_table]:w-full [&_table]:text-sm [&_table]:my-6 [&_th]:text-left [&_th]:font-sans [&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-muted-foreground [&_th]:pb-2 [&_th]:border-b [&_th]:border-border [&_td]:py-2 [&_td]:pr-4 [&_td]:border-b [&_td]:border-border [&_td]:align-top',
        '[&_pre]:font-mono [&_pre]:text-sm [&_pre]:bg-muted [&_pre]:rounded-md [&_pre]:p-4 [&_pre]:my-6 [&_pre]:overflow-x-auto',
        '[&_strong]:text-foreground',
        // footnotes (remark-gfm): a rule above, smaller type, room for the citation links
        '[&_section.footnotes]:mt-12 [&_section.footnotes]:pt-6 [&_section.footnotes]:border-t [&_section.footnotes]:border-border [&_section.footnotes]:text-[0.92rem] [&_section.footnotes]:leading-relaxed',
        '[&_sup]:text-[0.72em] [&_sup_a]:no-underline [&_sup_a]:text-primary [&_sup_a]:px-0.5',
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        urlTransform={urlTransform}
        components={{
          a: ({ href, children: kids, ...rest }) => {
            if (href?.startsWith(CITE_SCHEME)) {
              const id = href.slice(CITE_SCHEME.length);
              return (
                <a href={`${citeBase}#cite=${id}`} data-cite={id} className="cite-link" title="Open the cited page">
                  {kids}
                </a>
              );
            }
            // footnote refs/backrefs keep their ids and data-* (remark-gfm)
            return <a href={href} {...rest} className="underline underline-offset-2 text-primary">{kids}</a>;
          },
          code: ({ children: kids }) => <code className="font-mono text-[0.9em] bg-muted px-1 rounded">{kids}</code>,
        }}
      >
        {children}
      </ReactMarkdown>
    </article>
  );
}
