// Must match the enums in the ingestion prompt — see
// docs/superpowers/specs/2026-08-21-cluster-scoring-design.md.
export type Category =
  | "politics" | "economy" | "technology" | "environment"
  | "health" | "conflict" | "society" | "science";

export interface Article {
  id: number;
  title: string;
  url: string;
  source: string;
  author: string | null;
  published_at: string | null;
  cluster_id: number | null;
  fetched_at: string;
}

/**
 * Mirrors the backend's `ClusterBase`. The classification fields are typed `string | null`
 * rather than as literal unions on purpose: the decoder constrains them, but a prompt tweak
 * ships new values before this file learns about them, and a lie in the type would turn that
 * into a silently-dead branch instead of a value that renders as itself.
 */
export interface ClusterFields {
  main_title: string;
  /** Which part of an ordinary life this touches: prices | work | movement | safety | services | rights | none. */
  life_impact: string | null;
  /** How far along it is: happened | decided | proposed | discussed. */
  stage: string | null;
  /** People the headline explicitly states were harmed. 0 for most stories. */
  people_affected_stated: number;
  urgency: string;
  one_sentence_summary: string | null;
  countries_or_actors: string[];
  locations: string[];
  sources: string[];
  category: string | null;
  image: string | null;
}

export interface ClusterSummary extends ClusterFields {
  id: number;
  article_count: number;
  latest_published_at: string | null;
  /**
   * Server-computed rank, 0..~1.3 — above 1.0 only where a topic weight exceeds 1.0.
   * Null when the API omits it; never recomputed here.
   */
  score: number | null;
}

/** The detail payload. Carries no `score` — a rank only means something inside a feed. */
export interface ClusterRead extends ClusterFields {
  id: number;
  latest_published_at: string | null;
  created_at: string;
  updated_at: string;
  articles: Article[];
}
