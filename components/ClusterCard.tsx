import Link from "next/link";
import type { ClusterSummary } from "@/lib/types";
import CategoryBadge from "./CategoryBadge";
import SourceChips from "./SourceChips";
import ClusterImage from "./ClusterImage";
import WeightStrip from "./WeightStrip";
import { cardFacets } from "@/lib/scoring";

function relTime(iso: string | null, now: number): string {
  if (!iso) return "";
  const mins = Math.round((now - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.round(hrs / 24)}d`;
}

// The hover panel sits outside the card, so it must open toward the inside of the
// grid — cards in the last column open left, everyone else opens right. Column
// count is responsive (2 at sm, 3 at lg), so each breakpoint gets its own side.
// Full literal class strings: Tailwind scans source text, no runtime concatenation.
// The resting -/+ translate must be breakpoint-scoped, and so must the hover reset:
// a bare `group-hover:translate-x-0` would be overridden by the later `sm:` media rule.
const PANEL_RIGHT_SM =
  "sm:left-full sm:right-auto sm:-translate-x-2 sm:group-hover:translate-x-0 sm:group-focus-visible:translate-x-0 sm:rounded-l-none sm:rounded-r-xl sm:border-l-0 sm:border-r";
const PANEL_LEFT_SM =
  "sm:right-full sm:left-auto sm:translate-x-2 sm:group-hover:translate-x-0 sm:group-focus-visible:translate-x-0 sm:rounded-r-none sm:rounded-l-xl sm:border-r-0 sm:border-l";
const PANEL_RIGHT_LG =
  "lg:left-full lg:right-auto lg:-translate-x-2 lg:group-hover:translate-x-0 lg:group-focus-visible:translate-x-0 lg:rounded-l-none lg:rounded-r-xl lg:border-l-0 lg:border-r";
const PANEL_LEFT_LG =
  "lg:right-full lg:left-auto lg:translate-x-2 lg:group-hover:translate-x-0 lg:group-focus-visible:translate-x-0 lg:rounded-r-none lg:rounded-l-xl lg:border-r-0 lg:border-l";

const CARD_RIGHT_SM = "sm:hover:rounded-r-none sm:hover:rounded-l-xl";
const CARD_LEFT_SM = "sm:hover:rounded-l-none sm:hover:rounded-r-xl";
const CARD_RIGHT_LG = "lg:hover:rounded-r-none lg:hover:rounded-l-xl";
const CARD_LEFT_LG = "lg:hover:rounded-l-none lg:hover:rounded-r-xl";

const CARD_BASE =
  "group relative flex rounded-xl border border-hairline bg-surface transition-[box-shadow,border-color,border-radius] duration-200 hover:z-20 hover:border-ink/25 hover:shadow-[0_8px_36px_rgba(0,0,0,0.55)] focus-visible:z-20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export default function ClusterCard({
  cluster,
  now,
  index = 0,
  lead = false,
}: {
  cluster: ClusterSummary;
  /** Render clock, fixed by the server so SSR and hydration agree. */
  now: number;
  /** Position in the feed — decides which side the hover panel opens on. */
  index?: number;
  /** Top-ranked cluster: spans two columns and carries its summary inline. */
  lead?: boolean;
}) {
  const meta = (
    <div className="flex items-center justify-between gap-2">
      <CategoryBadge category={cluster.category} />
      <time className="font-mono text-[11px] text-muted">
        {relTime(cluster.latest_published_at, now)}
      </time>
    </div>
  );

  // What the weight is made of, in the formula's own order. Empty for a cluster ingested
  // before the classification fields existed, which renders as absence rather than as zero.
  const facets = cardFacets(cluster);

  const foot = (
    <div className="flex flex-col gap-2 pt-1">
      <WeightStrip cluster={cluster} />
      {facets.length > 0 && (
        <p className="line-clamp-1 font-mono text-[11px] text-muted">
          {facets.map((f) => f.reading).join(" · ")}
        </p>
      )}
      <div className="flex items-center justify-between gap-2">
        <SourceChips sources={cluster.sources} />
        <span className="shrink-0 font-mono text-[11px] text-muted">
          {cluster.article_count} {cluster.article_count === 1 ? "article" : "articles"}
        </span>
      </div>
    </div>
  );

  if (lead) {
    return (
      <Link
        href={`/clusters/${cluster.id}`}
        data-card
        className={`${CARD_BASE} flex-col sm:col-span-2 sm:flex-row`}
      >
        <div className="aspect-[16/10] w-full shrink-0 overflow-hidden rounded-t-xl sm:aspect-auto sm:w-1/2 sm:rounded-l-xl sm:rounded-tr-none">
          <div className="h-full w-full transition-transform duration-300 group-hover:scale-[1.03]">
            <ClusterImage
              src={cluster.image}
              alt={cluster.main_title}
              category={cluster.category}
            />
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
          {meta}
          <h2 className="font-display text-2xl leading-tight text-ink group-hover:text-accent sm:text-3xl">
            <span className="line-clamp-3">{cluster.main_title}</span>
          </h2>
          {cluster.one_sentence_summary && (
            <p className="line-clamp-3 text-[15px] leading-relaxed text-ink/70">
              {cluster.one_sentence_summary}
            </p>
          )}
          <div className="mt-auto">{foot}</div>
        </div>
      </Link>
    );
  }

  // Column position accounts for the lead card ahead of these, which spans two cells.
  const flipSm = index % 2 === 0; // last of 2 columns
  const flipLg = index % 3 === 1; // last of 3 columns

  const panelSide = `${flipSm ? PANEL_LEFT_SM : PANEL_RIGHT_SM} ${
    flipLg ? PANEL_LEFT_LG : PANEL_RIGHT_LG
  }`;
  const cardSide = `${flipSm ? CARD_LEFT_SM : CARD_RIGHT_SM} ${
    flipLg ? CARD_LEFT_LG : CARD_RIGHT_LG
  }`;

  return (
    <Link href={`/clusters/${cluster.id}`} data-card className={`${CARD_BASE} flex-col ${cardSide}`}>
      <div className="aspect-[16/10] w-full overflow-hidden rounded-t-xl">
        <div className="h-full w-full transition-transform duration-300 group-hover:scale-[1.03]">
          <ClusterImage src={cluster.image} alt={cluster.main_title} category={cluster.category} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        {meta}
        <h2 className="font-display text-lg leading-snug text-ink group-hover:text-accent">
          <span className="line-clamp-3">{cluster.main_title}</span>
        </h2>
        <div className="mt-auto">{foot}</div>
      </div>

      {/* Hover panel — sits beside the card (one column + the grid gap wide), layered
          over the neighbour. Absolute, so the grid never reflows. Hidden below sm,
          where there is one column and no pointer.
          Permanently pointer-events-none: hit-testing passes straight through it, so
          the card only counts as hovered while the cursor is on the card itself.
          Moving onto the panel collapses it and frees the neighbour underneath. */}
      {cluster.one_sentence_summary && (
        <div
          className={`pointer-events-none absolute top-0 hidden h-full w-[calc(100%+1.25rem)] border-hairline bg-surface opacity-0 shadow-[0_8px_36px_rgba(0,0,0,0.55)] transition-[opacity,transform] duration-200 sm:block group-hover:opacity-100 group-focus-visible:opacity-100 ${panelSide}`}
          aria-hidden
        >
          <div className="flex h-full flex-col justify-center gap-4 p-6">
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted">Summary</p>
            <p className="line-clamp-6 text-[15px] leading-relaxed text-ink/80">
              {cluster.one_sentence_summary}
            </p>
            {cluster.locations?.length > 0 && (
              <p className="line-clamp-1 font-mono text-[11px] uppercase tracking-wide text-muted">
                {cluster.locations.join(" · ")}
              </p>
            )}
          </div>
        </div>
      )}
    </Link>
  );
}
