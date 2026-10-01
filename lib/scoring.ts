import type { ClusterFields } from "./types";

/**
 * Ranking lives in the backend now — `app/config/ranking.py` and `score_expr` in
 * `app/crud/clusters.py`, per docs/superpowers/specs/2026-08-21-cluster-scoring-design.md.
 * This file used to carry a second copy of the weights so the UI could draw a bar before the
 * API returned one. It doesn't any more: two copies of six weights and two half-lives drift
 * within a week. What's left is reading the server's number and saying what it is made of.
 */

/**
 * The clock a render pass is measured against, sampled once per request and passed down.
 * Deliberately impure and deliberately not called inside components: sampling it once at the
 * top of a page keeps every relative time on that page consistent, and keeps the server's
 * markup identical to what the client hydrates.
 */
export function renderClock(): number {
  return Date.now();
}

/**
 * The clock the API actually scored against, from its `X-as-of` header. Using it rather than
 * a local `Date.now()` keeps the card's "3h" agreeing with the decay that ranked it.
 */
export function clockFrom(asOf: string | null): number {
  if (!asOf) return renderClock();
  const parsed = Date.parse(asOf);
  return Number.isFinite(parsed) ? parsed : renderClock();
}

/**
 * Score as a 0..~130 integer. The bar clamps at 100; the printed number doesn't, so a
 * topic-weighted story above 1.0 still reads as heavier than a full bar.
 */
export function scorePercent(score: number | null): number | null {
  if (score === null || score === undefined || !Number.isFinite(score)) return null;
  return Math.round(score * 100);
}

export type Facet = {
  key: "impact" | "stage" | "coverage" | "toll" | "urgency";
  label: string;
  reading: string;
};

type Faceted = Pick<
  ClusterFields,
  "life_impact" | "stage" | "people_affected_stated" | "urgency" | "sources"
>;

/**
 * What the score is made of, in the order the formula weights them.
 *
 * Every facet is omitted when it has nothing to say — `life_impact: "none"` is the common case
 * and "affects nothing" is noise, a single outlet isn't coverage, and most headlines state no
 * toll. A cluster ingested before the schema change has nulls throughout and yields an empty
 * list, which callers must render as absence rather than as zero.
 */
export function clusterFacets(cluster: Faceted): Facet[] {
  const facets: Facet[] = [];

  if (cluster.life_impact && cluster.life_impact !== "none") {
    facets.push({ key: "impact", label: "Impact", reading: `affects ${cluster.life_impact}` });
  }
  if (cluster.stage) {
    facets.push({ key: "stage", label: "Stage", reading: cluster.stage });
  }

  const outlets = cluster.sources?.length ?? 0;
  if (outlets > 1) {
    facets.push({ key: "coverage", label: "Coverage", reading: `${outlets} outlets` });
  }

  if (cluster.people_affected_stated > 0) {
    facets.push({
      key: "toll",
      label: "Toll",
      reading: `${cluster.people_affected_stated.toLocaleString("en-US")} people`,
    });
  }

  if (cluster.urgency) {
    facets.push({ key: "urgency", label: "Urgency", reading: cluster.urgency });
  }

  return facets;
}

/**
 * The card's version: urgency is already the card's one hue and the outlets are already
 * spelled out by SourceChips, so repeating either in text is duplication.
 */
export function cardFacets(cluster: Faceted): Facet[] {
  return clusterFacets(cluster).filter((f) => f.key !== "urgency" && f.key !== "coverage");
}

// Colour is a data channel here, not decoration: the only hue on a card encodes urgency.
// A heat spectrum — cool teal is something to read later, hot rose is happening now.
const URGENCY_COLORS: Record<string, string> = {
  low: "#35d0b0",
  medium: "#ffb020",
  high: "#ff4d6d",
};

/** Neutral fill for anything that isn't urgency — carries length, not meaning. */
const NEUTRAL_BAR = "#8a90ab";

export function urgencyColor(urgency: string | null): string {
  return URGENCY_COLORS[(urgency ?? "").toLowerCase()] ?? NEUTRAL_BAR;
}
