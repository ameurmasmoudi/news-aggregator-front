import Link from "next/link";
import type { CSSProperties } from "react";
import type { ClusterSummary } from "@/lib/types";
import CategoryBadge from "./CategoryBadge";
import ClusterImage from "./ClusterImage";
import Coverage from "./Coverage";
import WeightStrip from "./WeightStrip";
import { urgencyColor } from "@/lib/scoring";

/**
 * The shape a story takes in the bento grid. Placement (which cells it spans) is decided by the
 * Feed; the tile only decides how to fill the cell it was given.
 * - hero:  full-bleed photo, headline set over it
 * - tall:  photo on top, text below
 * - wide:  photo left, text right
 * - pano:  wider still, with room for the summary
 * - small: text only, tinted by urgency
 * Any photo shape falls back to a tinted text tile when the story has no image.
 */
export type TileKind = "hero" | "tall" | "wide" | "pano" | "small";

function relTime(iso: string | null, now: number): string {
  if (!iso) return "";
  const mins = Math.round((now - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

const TILE =
  "tile-in group relative flex overflow-hidden rounded-[20px] transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:shadow-[0_14px_40px_-16px_color-mix(in_oklab,var(--tone)_45%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-[0.99]";

// Text tiles carry the story's urgency as a wash, so a run of them is never grey-on-grey.
const TINT = "bg-[color-mix(in_oklab,var(--tone)_12%,var(--surface))]";

const PHOTO =
  "h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]";

export default function ClusterCard({
  cluster,
  now,
  kind,
  index = 0,
  className = "",
}: {
  cluster: ClusterSummary;
  /** Render clock, fixed by the server so SSR and hydration agree. */
  now: number;
  kind: TileKind;
  /** Position within its page, for the entry stagger. */
  index?: number;
  /** Grid placement, from the Feed. */
  className?: string;
}) {
  const href = `/clusters/${cluster.id}`;
  const time = relTime(cluster.latest_published_at, now);
  const style = { "--tone": urgencyColor(cluster.urgency), "--i": index } as CSSProperties;
  const shape = cluster.image ? kind : "text";
  const lead = kind === "hero";

  const meta = (inverse: boolean) => (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
      <CategoryBadge category={cluster.category} inverse={inverse} />
      <WeightStrip cluster={cluster} inverse={inverse} />
      {time && (
        <time
          dateTime={cluster.latest_published_at ?? undefined}
          className={`text-xs tabular-nums ${inverse ? "text-white/75" : "text-muted"}`}
        >
          {time}
        </time>
      )}
    </div>
  );

  const summary = (clamp: string, inverse = false) =>
    cluster.one_sentence_summary && (
      <p
        className={`${clamp} text-sm leading-relaxed ${inverse ? "text-white/80" : "text-ink/70"}`}
      >
        {cluster.one_sentence_summary}
      </p>
    );

  if (shape === "hero") {
    return (
      <Link href={href} data-card style={style} className={`${TILE} min-h-[26rem] ${className}`}>
        <div className="absolute inset-0">
          <div className={PHOTO}>
            <ClusterImage src={cluster.image!} alt={cluster.main_title} priority={index === 0} />
          </div>
        </div>
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-black/0"
        />
        <div className="relative mt-auto flex flex-col gap-3 p-5 sm:p-7">
          {meta(true)}
          <h2 className="text-balance font-display text-3xl font-bold leading-[1.05] tracking-tight text-white sm:text-4xl">
            {cluster.main_title}
          </h2>
          {summary("line-clamp-2 max-w-[60ch] sm:text-base", true)}
          <Coverage sources={cluster.sources} count={cluster.article_count} inverse />
        </div>
      </Link>
    );
  }

  if (shape === "tall") {
    return (
      <Link
        href={href}
        data-card
        style={style}
        className={`${TILE} flex-col bg-surface ${className}`}
      >
        <div className="aspect-[4/3] w-full shrink-0 overflow-hidden lg:aspect-auto lg:min-h-0 lg:flex-1">
          <div className={PHOTO}>
            <ClusterImage src={cluster.image!} alt="" />
          </div>
        </div>
        <div className="flex flex-col gap-2.5 p-5">
          {meta(false)}
          <h3 className="line-clamp-3 font-display text-xl font-semibold leading-tight tracking-tight">
            {cluster.main_title}
          </h3>
          <Coverage sources={cluster.sources} count={cluster.article_count} className="line-clamp-1" />
        </div>
      </Link>
    );
  }

  if (shape === "wide" || shape === "pano") {
    const pano = shape === "pano";
    return (
      <Link
        href={href}
        data-card
        style={style}
        className={`${TILE} flex-col bg-surface sm:flex-row ${className}`}
      >
        <div
          className={`aspect-[16/9] w-full shrink-0 overflow-hidden sm:aspect-auto ${
            pano ? "sm:w-[38%]" : "sm:w-[44%]"
          }`}
        >
          <div className={PHOTO}>
            <ClusterImage src={cluster.image!} alt="" />
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2.5 p-5">
          {meta(false)}
          <h3
            className={`line-clamp-3 font-display font-semibold leading-tight tracking-tight ${
              pano ? "text-2xl" : "text-xl"
            }`}
          >
            {cluster.main_title}
          </h3>
          {summary(pano ? "line-clamp-3" : "line-clamp-2")}
          <Coverage
            sources={cluster.sources}
            count={cluster.article_count}
            className="mt-auto line-clamp-1"
          />
        </div>
      </Link>
    );
  }

  // Text tile: the small shape, and every photo shape whose story came without a photo.
  return (
    <Link
      href={href}
      data-card
      style={style}
      className={`${TILE} ${TINT} min-h-44 flex-col gap-3 p-5 ${lead ? "sm:p-7" : ""} ${className}`}
    >
      {meta(false)}
      <h3
        className={`font-display font-semibold leading-tight tracking-tight ${
          lead ? "text-3xl font-bold sm:text-4xl" : "line-clamp-3 text-lg"
        }`}
      >
        {cluster.main_title}
      </h3>
      {summary(lead ? "line-clamp-4 sm:text-base" : kind === "small" ? "line-clamp-2" : "line-clamp-3")}
      <Coverage
        sources={cluster.sources}
        count={cluster.article_count}
        className="mt-auto line-clamp-2"
      />
    </Link>
  );
}
