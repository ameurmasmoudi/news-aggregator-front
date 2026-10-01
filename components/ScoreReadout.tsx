import { clusterFacets, urgencyColor } from "@/lib/scoring";
import type { ClusterRead } from "@/lib/types";

/**
 * The cluster page's version of the card's weight bar. It shows no number, because the detail
 * payload carries none and shouldn't: a score is a position within a feed measured against one
 * clock, and it means nothing on a page showing a single story. What it can say — and what the
 * old "Importance 35 / 100" never could — is what the ranking actually read off this cluster,
 * in terms a reader can check against the headline.
 */
export default function ScoreReadout({ cluster }: { cluster: ClusterRead }) {
  const facets = clusterFacets(cluster);
  if (!facets.length) return null;

  const hue = urgencyColor(cluster.urgency);

  return (
    <div className="rounded-xl border border-hairline bg-surface p-4">
      <p className="mb-4 font-mono text-[11px] uppercase tracking-widest text-muted">
        What this weighs
      </p>

      <dl className="flex flex-col gap-2">
        {facets.map((facet) => (
          <div key={facet.key} className="grid grid-cols-[5.5rem_1fr] items-baseline gap-3">
            <dt className="font-mono text-[11px] uppercase tracking-wide text-muted">
              {facet.label}
            </dt>
            <dd
              className="font-mono text-xs text-ink/70"
              style={facet.key === "urgency" ? { color: hue } : undefined}
            >
              {facet.reading}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-4 border-t border-hairline pt-3 font-mono text-[11px] leading-relaxed text-muted">
        Ranked server-side from these, weighted by topic and decayed by age — half-life 48h.
      </p>
    </div>
  );
}
