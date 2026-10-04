"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  DEFAULT_SORT,
  DEFAULT_WINDOW,
  SORTS,
  SORT_LABEL,
  WINDOWS,
  WINDOW_LABEL,
  parseSort,
  parseWindow,
} from "@/lib/api";

/**
 * Sort and time-window for the feed. Rendered as segmented groups rather than as more chips:
 * the chip row is a filter on *what* you see, this is a control on *how it is ordered*,
 * and giving them the same shape would read as one long list of filters.
 */
export default function FeedControls() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  // Ordering only exists on the feed; off it (e.g. /clusters/[id]) nothing is active.
  const onFeed = pathname === "/";
  const sort = onFeed ? parseSort(params.get("sort")) : DEFAULT_SORT;
  const feedWindow = onFeed ? parseWindow(params.get("window")) : DEFAULT_WINDOW;

  function set(key: "sort" | "window", value: string, isDefault: boolean) {
    const next = new URLSearchParams(params.toString());
    next.delete("offset");
    // Defaults stay out of the URL, so the canonical feed is a bare `/`.
    if (isDefault) next.delete(key);
    else next.set(key, value);
    const qs = next.toString();
    router.push(qs ? `/?${qs}` : "/");
  }

  return (
    <div className="flex shrink-0 items-center gap-2">
      <Segmented label="Sort">
        {SORTS.map((s) => (
          <Segment
            key={s}
            active={onFeed && sort === s}
            onClick={() => set("sort", s, s === DEFAULT_SORT)}
          >
            {SORT_LABEL[s]}
          </Segment>
        ))}
      </Segmented>

      <Segmented label="Time window">
        {WINDOWS.map((w) => (
          <Segment
            key={w}
            active={onFeed && feedWindow === w}
            onClick={() => set("window", w, w === DEFAULT_WINDOW)}
          >
            {WINDOW_LABEL[w]}
          </Segment>
        ))}
      </Segmented>
    </div>
  );
}

function Segmented({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div role="group" aria-label={label} className="flex items-center gap-0.5 rounded-full bg-surface p-1">
      {children}
    </div>
  );
}

function Segment({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-3 py-1 text-[13px] font-medium tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-[0.96] ${
        active ? "bg-ink text-paper" : "text-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
