import { sourceLabel } from "@/lib/sources";

const list = new Intl.ListFormat("en", { style: "long", type: "conjunction" });

/**
 * "6 articles from BBC, Al Jazeera and France 24": the story's coverage as a sentence rather
 * than a strip of chips. Feed slugs are not names (see lib/sources.ts), and they're deduplicated
 * because two identifiers can map to one outlet, and "BBC and BBC" reads as a bug.
 */
export default function Coverage({
  sources,
  count,
  inverse = false,
  className = "",
}: {
  sources: string[];
  count: number;
  /** Set over a photo. */
  inverse?: boolean;
  className?: string;
}) {
  const labels = [...new Set((sources ?? []).map(sourceLabel).filter(Boolean))];
  const articles = `${count} ${count === 1 ? "article" : "articles"}`;

  return (
    <p className={`text-xs ${inverse ? "text-white/70" : "text-muted"} ${className}`}>
      {articles}
      {labels.length > 0 && (
        <>
          {" from "}
          <span className={inverse ? "text-white" : "text-ink/85"}>{list.format(labels)}</span>
        </>
      )}
    </p>
  );
}
