// app/_components/presentation.ts — display hygiene shared by the Next pages.
//
// Processor/CMS label suffixes never reach the page ("… - Case Documents",
// "… (Enhanced)") — the data keeps them, the presentation drops them.
export function displayTitle(title: string): string {
  return title
    .replace(/\s*[-–—]\s*Case Documents$/i, '')
    .replace(/\s*\(Enhanced\)$/i, '')
    .trim();
}
