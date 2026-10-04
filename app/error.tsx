"use client";
import Link from "next/link";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-72 flex-col items-start justify-end gap-4 rounded-[20px] bg-surface p-7">
      <p className="font-display text-2xl font-semibold tracking-tight">The feed didn&apos;t load.</p>
      <p className="max-w-[56ch] text-sm leading-relaxed text-muted">
        The backend may be down, or this particular view may be failing on its own. Some filter
        and window combinations can error while the rest of the feed is fine.
      </p>
      <div className="mt-1 flex flex-wrap items-center gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper transition-transform hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-[0.97]"
        >
          Try again
        </button>
        {/*
          The way out. `reset()` only re-runs the same failed render, so a view that fails
          deterministically — a bad row that only one window selects, say — leaves the reader
          pressing a button that can never work. This drops every filter and returns to the
          default feed, which is the one combination most likely to still be up.
        */}
        <Link
          href="/"
          className="rounded-full bg-surface-2 px-5 py-2 text-sm font-medium text-ink transition-colors hover:bg-hairline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-[0.97]"
        >
          Back to the feed
        </Link>
      </div>
    </div>
  );
}
