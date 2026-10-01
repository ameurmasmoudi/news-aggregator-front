"use client";
import Link from "next/link";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="py-20 text-center">
      <p className="font-display text-xl text-ink">The feed didn&apos;t load.</p>
      <p className="mx-auto mt-2 max-w-md font-mono text-xs leading-relaxed text-muted">
        The backend may be down, or this particular view may be failing on its own — some filter
        and window combinations can error while the rest of the feed is fine.
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-full border border-ink px-5 py-2 text-sm text-ink transition-colors hover:bg-ink hover:text-paper"
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
          className="rounded-full border border-hairline px-5 py-2 text-sm text-muted transition-colors hover:border-ink/40 hover:text-ink"
        >
          Back to the feed
        </Link>
      </div>
    </div>
  );
}
