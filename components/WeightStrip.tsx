import { cardFacets, scorePercent, urgencyColor } from "@/lib/scoring";
import type { ClusterSummary } from "@/lib/types";

/**
 * The card's weight bar: length is the score the server ranked this cluster by, colour is its
 * urgency. One mark, two readings — how heavy this story is, and how fast it is moving.
 */
export default function WeightStrip({ cluster }: { cluster: ClusterSummary }) {
  const pct = scorePercent(cluster.score);
  if (pct === null) return null;

  const facets = cardFacets(cluster)
    .map((f) => f.reading)
    .join(" · ");

  return (
    <div
      className="flex items-center gap-2"
      title={facets ? `Weight ${pct} — ${facets}` : `Weight ${pct}`}
    >
      <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-hairline">
        <div
          className="h-full rounded-full transition-[width] duration-300"
          // Clamped at 100: a topic weight above 1.0 can push the score past a full bar, and
          // the printed number is where that surplus stays legible.
          style={{
            width: `${Math.min(Math.max(pct, 2), 100)}%`,
            backgroundColor: urgencyColor(cluster.urgency),
          }}
        />
      </div>
      <span className="font-mono text-[11px] tabular-nums text-muted">{pct}</span>
    </div>
  );
}
