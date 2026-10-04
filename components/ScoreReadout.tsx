import { clusterFacets, urgencyColor } from "@/lib/scoring";
import type { ClusterRead } from "@/lib/types";

/**
 * The cluster page's version of the feed's weight mark. It shows no number, because the detail
 * payload carries none and shouldn't: a score is a position within a feed measured against one
 * clock, and it means nothing on a page showing a single story. What it can say, and what the
 * old "Importance 35 / 100" never could, is what the ranking actually read off this cluster,
 * in terms a reader can check against the headline.
 */
export default function ScoreReadout({ cluster }: { cluster: ClusterRead }) {
  const facets = clusterFacets(cluster);
  if (!facets.length) return null;

  const hue = urgencyColor(cluster.urgency);

  return (
    <div className="flex h-full flex-col rounded-[20px] bg-[color-mix(in_oklab,var(--tone)_12%,var(--surface))] p-6">
      <h2 className="font-display text-xl font-semibold tracking-tight">How it was weighed</h2>

      <dl className="mt-4 grid grid-cols-2 gap-2">
        {facets.map((facet) => (
          <div key={facet.key} className="flex flex-col gap-1 rounded-2xl bg-surface/70 p-3.5">
            <dt className="text-xs text-muted">{facet.label}</dt>
            <dd className="flex items-center gap-2 font-medium text-ink">
              {facet.key === "urgency" && (
                <span
                  aria-hidden
                  className="block h-2 w-2 rounded-full"
                  style={{ backgroundColor: hue }}
                />
              )}
              {facet.reading.charAt(0).toUpperCase() + facet.reading.slice(1)}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-auto pt-5 text-xs leading-relaxed text-muted">
        The feed ranks stories on these signals, weighted by topic and decayed by age with a
        48-hour half-life.
      </p>
    </div>
  );
}
