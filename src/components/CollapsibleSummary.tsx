import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import ImageEnhancedMarkdownRenderer from "@/components/ImageEnhancedMarkdownRenderer";
import { cn } from "@/lib/utils";

interface CollapsibleSummaryProps {
  content: string;
  proseClassName?: string;
  title?: string;
}

// Document Summary shown beneath a PDF viewer. Collapsed by default; click the
// header to expand. Shared by the homepage featured section and the section page.
export const CollapsibleSummary = ({
  content,
  proseClassName = "prose-lg",
  title = "Document Summary",
}: CollapsibleSummaryProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="mt-8 panel-soft p-6">
      <CollapsibleTrigger className="group flex w-full items-center justify-between gap-4 text-left">
        <h3
          className="text-2xl font-serif text-foreground"
          style={{ letterSpacing: "-0.018em" }}
        >
          {title}
        </h3>
        <ChevronDown
          className={cn(
            "h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className={cn("mt-4 prose max-w-none", proseClassName)}>
          <ImageEnhancedMarkdownRenderer
            content={content}
            images={[]}
            showToggle={false}
            className="text-lg"
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default CollapsibleSummary;
