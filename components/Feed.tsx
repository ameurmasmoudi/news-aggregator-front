"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { ClusterSummary } from "@/lib/types";
import { WINDOW_PHRASE, type FeedSort, type FeedWindow } from "@/lib/api";
import ClusterCard, { type TileKind } from "./ClusterCard";

// Two bento blocks per page (see layout below), so a page never ends mid-block and the grid
// never has to reshuffle tiles a reader has already seen when the next page arrives.
const LIMIT = 18;

type Slot = { kind: TileKind; span: string };

const HERO: Slot = { kind: "hero", span: "sm:col-span-2 lg:col-span-2 lg:row-span-2" };
const TALL: Slot = { kind: "tall", span: "lg:row-span-2" };
const WIDE: Slot = { kind: "wide", span: "sm:col-span-2 lg:col-span-2" };
const PANO: Slot = { kind: "pano", span: "sm:col-span-2 lg:col-span-3" };
const SMALL: Slot = { kind: "small", span: "" };

/**
 * Two nine-tile blocks that each fill exactly four rows of a four-column grid, alternated so
 * the big tile swaps sides down the page. Both also tile a two-column grid without holes.
 *
 *   A: [ HERO  ][s][s]     B: [s][s][ HERO  ]
 *      [ HERO  ][WIDE ]       [WIDE ][ HERO  ]
 *      [T][s][s][s]           [  PANO   ][T]
 *      [T][  PANO   ]         [s][s][s][T]
 */
const BLOCK_A: Slot[] = [HERO, SMALL, SMALL, WIDE, TALL, SMALL, SMALL, SMALL, PANO];
const BLOCK_B: Slot[] = [SMALL, SMALL, HERO, WIDE, PANO, TALL, SMALL, SMALL, SMALL];

/** Leftovers that don't make a block: full rows of up to four, each row filled edge to edge. */
function rows(n: number): Slot[] {
  const out: Slot[] = [];
  for (let left = n; left > 0; left -= 4) {
    const k = Math.min(left, 4);
    if (k === 1) out.push({ kind: "pano", span: "sm:col-span-2 lg:col-span-4" });
    else if (k === 2) out.push(WIDE, WIDE);
    else if (k === 3) out.push(WIDE, SMALL, SMALL);
    else out.push(SMALL, SMALL, SMALL, SMALL);
  }
  return out;
}

function layout(n: number): Slot[] {
  if (n === 0) return [];
  if (n === 1) return [{ kind: "hero", span: "sm:col-span-2 lg:col-span-4 lg:row-span-2" }];
  if (n < 9) {
    // A short feed (a narrow search, a quiet window) still leads with a hero, and fills the
    // 2x2 beside it before falling back to plain rows.
    const right = Math.min(n - 1, 4);
    const beside: Slot[][] = [
      [],
      [{ kind: "tall", span: "sm:col-span-2 lg:col-span-2 lg:row-span-2" }],
      [WIDE, WIDE],
      [WIDE, SMALL, SMALL],
      [SMALL, SMALL, SMALL, SMALL],
    ];
    return [HERO, ...beside[right], ...rows(n - 1 - right)];
  }
  const full = n - (n % 9);
  const out: Slot[] = [];
  for (let i = 0; i < full; i++) out.push((Math.floor(i / 9) % 2 ? BLOCK_B : BLOCK_A)[i % 9]);
  return [...out, ...rows(n % 9)];
}

export default function Feed({
  initial,
  category,
  tunisian,
  q,
  sort,
  window: feedWindow,
  asOf,
  now,
}: {
  initial: ClusterSummary[];
  category?: string;
  tunisian?: boolean;
  /** Already normalised upstream — whatever arrives here is exactly what the API was sent. */
  q?: string;
  sort: FeedSort;
  window: FeedWindow;
  /** The clock the first page was scored against; pinned on every later page. */
  asOf: string | null;
  /** Render clock from the server, so relative times don't shift on hydration. */
  now: number;
}) {
  const [items, setItems] = useState<ClusterSummary[]>(initial);
  const [offset, setOffset] = useState(initial.length);
  const [hasMore, setHasMore] = useState(initial.length === LIMIT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const sentinel = useRef<HTMLDivElement | null>(null);
  const grid = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    setError(false);
    try {
      const qs = new URLSearchParams({ limit: String(LIMIT), offset: String(offset) });
      if (tunisian) qs.set("tunisian", "true");
      else if (category) qs.set("category", category);
      if (q) qs.set("q", q);
      qs.set("sort", sort);
      qs.set("window", feedWindow);
      // Pinning the first page's clock is what keeps the ordering stable while paging:
      // without it each page is scored a few seconds later and rows can repeat or vanish.
      if (asOf) qs.set("as_of", asOf);

      const res = await fetch(`/api/clusters?${qs.toString()}`);
      if (!res.ok) throw new Error("fetch failed");
      const next: ClusterSummary[] = await res.json();

      setItems((prev) => [...prev, ...next]);
      setOffset((prev) => prev + next.length);
      setHasMore(next.length === LIMIT);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, offset, category, tunisian, q, sort, feedWindow, asOf]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasMore) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "600px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore, hasMore]);

  // j/k walk the feed, Enter opens — the cards are real links, so focus does the work.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "j" && event.key !== "k") return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable)
        return;

      const cards = Array.from(
        grid.current?.querySelectorAll<HTMLAnchorElement>("a[data-card]") ?? [],
      );
      if (!cards.length) return;

      const current = cards.indexOf(document.activeElement as HTMLAnchorElement);
      const next =
        current === -1
          ? 0
          : event.key === "j"
            ? Math.min(current + 1, cards.length - 1)
            : Math.max(current - 1, 0);

      event.preventDefault();
      cards[next].focus();
      cards[next].scrollIntoView({
        block: "center",
        behavior: globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
    }

    globalThis.addEventListener("keydown", onKeyDown);
    return () => globalThis.removeEventListener("keydown", onKeyDown);
  }, []);

  if (!items.length) {
    // A windowed query also drops every cluster with a NULL latest_published_at, so "nothing
    // here" is far more often the window than the filter. Name it, and offer the way out.
    const widen = new URLSearchParams();
    if (tunisian) widen.set("tunisian", "true");
    else if (category) widen.set("category", category);
    if (q) widen.set("q", q);
    if (sort !== "top") widen.set("sort", sort);
    widen.set("window", "all");

    return (
      <div className="flex min-h-72 flex-col items-start justify-end gap-4 rounded-[20px] bg-surface p-7">
        <p className="max-w-[36ch] font-display text-2xl font-semibold leading-snug tracking-tight">
          {q ? (
            <>
              No matches for “{q}” in {WINDOW_PHRASE[feedWindow]}
            </>
          ) : (
            <>Nothing in {WINDOW_PHRASE[feedWindow]}</>
          )}
          {category ? ` under ${category}` : tunisian ? " about Tunisia" : ""}.
        </p>
        {feedWindow !== "all" && (
          <Link
            href={`/?${widen.toString()}`}
            className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper transition-transform hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-[0.97]"
          >
            Search all time
          </Link>
        )}
      </div>
    );
  }

  const slots = layout(items.length);

  return (
    <>
      <div
        ref={grid}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:auto-rows-[16.5rem] lg:grid-cols-4"
      >
        {items.map((c, i) => (
          <ClusterCard
            key={c.id}
            cluster={c}
            now={now}
            kind={slots[i].kind}
            className={slots[i].span}
            index={i % LIMIT}
          />
        ))}
        {loading && <BlockSkeleton />}
      </div>

      <div ref={sentinel} className="h-px w-full" aria-hidden />

      <div className="flex items-center justify-center gap-3 py-8 text-sm text-muted" aria-live="polite">
        {error && (
          <>
            <span>Couldn&apos;t load more stories.</span>
            <button
              onClick={loadMore}
              className="rounded-full bg-ink px-4 py-1.5 font-medium text-paper transition-transform hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-[0.97]"
            >
              Retry
            </button>
          </>
        )}
        {!hasMore && !loading && <span>You&apos;re all caught up</span>}
      </div>
    </>
  );
}

/** Stands in for the next block while it loads: one row of four, shaped like what's coming. */
function BlockSkeleton() {
  const block = "rounded-[20px] bg-surface motion-safe:animate-pulse";
  return (
    <>
      <div className={`${block} min-h-44 sm:col-span-2 lg:col-span-2`} aria-hidden />
      <div className={`${block} min-h-44`} aria-hidden />
      <div className={`${block} min-h-44`} aria-hidden />
    </>
  );
}
