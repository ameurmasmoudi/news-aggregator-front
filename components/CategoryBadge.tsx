import Link from "next/link";

// Category is a filing label, not a signal, so it gets a neutral pill and no colour of its own.
// The only hue on a tile belongs to urgency (see lib/scoring.ts).
const BASE = "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize";
const TONE = {
  default: "bg-ink/[0.07] text-ink/80",
  inverse: "bg-white/15 text-white backdrop-blur-sm",
};

export default function CategoryBadge({
  category,
  asLink = false,
  inverse = false,
}: {
  category: string | null;
  /** Render as a link to the filtered feed. Never use inside another link. */
  asLink?: boolean;
  /** Set over a photo. */
  inverse?: boolean;
}) {
  if (!category) return null;
  const tone = TONE[inverse ? "inverse" : "default"];

  if (!asLink) {
    return <span className={`${BASE} ${tone}`}>{category}</span>;
  }

  return (
    <Link
      href={`/?category=${encodeURIComponent(category)}`}
      className={`${BASE} ${tone} transition-colors hover:bg-ink hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink`}
      title={`See all ${category} stories`}
    >
      {category}
    </Link>
  );
}
