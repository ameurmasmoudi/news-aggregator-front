import Link from "next/link";

// Category is a filing label, not a signal — so it's set in mono, not given a colour.
// The only hue on a card belongs to urgency (see lib/scoring.ts).
const BASE = "font-mono text-[11px] uppercase tracking-widest text-muted";

export default function CategoryBadge({
  category,
  asLink = false,
}: {
  category: string | null;
  /** Render as a link to the filtered feed. Never use inside another link. */
  asLink?: boolean;
}) {
  if (!category) return null;

  if (!asLink) {
    return <span className={BASE}>{category}</span>;
  }

  return (
    <Link
      href={`/?category=${encodeURIComponent(category)}`}
      className={`${BASE} underline decoration-hairline underline-offset-4 transition-colors hover:text-ink hover:decoration-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`}
      title={`See all ${category} clusters`}
    >
      {category}
    </Link>
  );
}
