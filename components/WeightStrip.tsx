import { cardFacets, scorePercent, urgencyColor } from "@/lib/scoring";
import type { ClusterSummary } from "@/lib/types";

/**
 * The story's weight mark: length is the score the server ranked this cluster by, colour is its
 * urgency. One mark, two readings: how heavy this story is, and how fast it is moving. No track
 * behind it, so it reads as a quantity, not as a progress bar waiting to fill.
 */
export default function WeightStrip({
  cluster,
  inverse = false,
}: {
  cluster: ClusterSummary;
  /** Set over a photo. */
  inverse?: boolean;
}) {
  const pct = scorePercent(cluster.score);
  if (pct === null) return null;

  const facets = cardFacets(cluster)
    .map((f) => f.reading)
    .join(", ");

  return (
    <span
      className="inline-flex items-center gap-1.5"
      title={facets ? `Weight ${pct}: ${facets}` : `Weight ${pct}`}
    >
      <span aria-hidden className="block w-8">
        <span
          className="block h-1 rounded-full"
          // Clamped at 100: a topic weight above 1.0 can push the score past a full bar, and
          // the printed number is where that surplus stays legible.
          style={{
            width: `${Math.min(Math.max(pct, 8), 100)}%`,
            backgroundColor: urgencyColor(cluster.urgency),
          }}
        />
      </span>
      <span
        className={`font-mono text-xs tabular-nums ${inverse ? "text-white/85" : "text-ink/75"}`}
      >
        {pct}
      </span>
    </span>
  );
}
