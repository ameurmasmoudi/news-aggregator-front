"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { ClusterSummary } from "@/lib/types";
import { WINDOW_PHRASE, type FeedSort, type FeedWindow } from "@/lib/api";
import ClusterCard from "./ClusterCard";

const LIMIT = 20;

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
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="font-mono text-sm text-muted">
          {q ? (
            <>
              No matches for <span className="text-ink">“{q}”</span> in{" "}
              {WINDOW_PHRASE[feedWindow]}
            </>
          ) : (
            <>Nothing in {WINDOW_PHRASE[feedWindow]}</>
          )}
          {category ? ` under ${category}` : tunisian ? " about Tunisia" : ""}.
        </p>
        {feedWindow !== "all" && (
          <Link
            href={`/?${widen.toString()}`}
            className="rounded-full border border-hairline px-4 py-1.5 font-mono text-xs text-ink hover:bg-white/[0.06]"
          >
            Search all time
          </Link>
        )}
      </div>
    );
  }

  const [lead, ...rest] = items;

  return (
    <>
      <div ref={grid} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <ClusterCard cluster={lead} now={now} lead />
        {rest.map((c, i) => (
          <ClusterCard key={c.id} cluster={c} now={now} index={i + 1} />
        ))}
      </div>

      <div ref={sentinel} className="h-px w-full" aria-hidden />

      <div className="py-8 text-center">
        {loading && <span className="font-mono text-xs text-muted">Loading…</span>}
        {error && (
          <button
            onClick={loadMore}
            className="rounded-full border border-hairline px-4 py-1.5 font-mono text-xs text-ink hover:bg-white/[0.06]"
          >
            Retry
          </button>
        )}
        {!hasMore && !loading && <span className="font-mono text-xs text-muted">End of feed</span>}
      </div>
    </>
  );
}
