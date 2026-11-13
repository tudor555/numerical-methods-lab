import katex from "katex";
import { cn } from "@/lib/utils";

function render(tex: string, displayMode: boolean): string {
  return katex.renderToString(tex, { displayMode, throwOnError: false, output: "htmlAndMathml" });
}

export function Tex({ tex, className }: { tex: string; className?: string }) {
  return <span className={className} dangerouslySetInnerHTML={{ __html: render(tex, false) }} />;
}

/** Display formula in a raised block that scrolls sideways on narrow screens. */
export function Formula({ tex, className }: { tex: string; className?: string }) {
  return (
    <div
      className={cn("border-border bg-raised rounded-lg border px-4 py-4", className)}
      dangerouslySetInnerHTML={{ __html: render(tex, true) }}
    />
  );
}

/** Text with inline TeX between `$…$`. */
export function RichText({ text }: { text: string }) {
  const parts = text.split(/\$([^$]+)\$/g);
  return <>{parts.map((part, i) => (i % 2 === 1 ? <Tex key={i} tex={part} /> : part))}</>;
}
