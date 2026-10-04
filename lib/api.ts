import type { ClusterSummary, ClusterRead } from "./types";

// Trailing slashes stripped so `https://host/` doesn't produce `//clusters/`.
const BASE = (process.env.API_BASE_URL ?? "https://news-back.ameur.dev").replace(/\/+$/, "");

export type FeedSort = "top" | "latest";
export type FeedWindow = "24h" | "7d" | "30d" | "all";

export const SORTS: FeedSort[] = ["top", "latest"];
export const WINDOWS: FeedWindow[] = ["24h", "7d", "30d", "all"];

// The API's own defaults, restated so the UI can mark the active control without
// having to send the params on the first request.
export const DEFAULT_SORT: FeedSort = "top";
export const DEFAULT_WINDOW: FeedWindow = "7d";

/** Short label for the control. */
export const WINDOW_LABEL: Record<FeedWindow, string> = {
  "24h": "24h",
  "7d": "7d",
  "30d": "30d",
  all: "All",
};

/** Prose form, for the empty state — an empty feed should name the window it searched. */
export const WINDOW_PHRASE: Record<FeedWindow, string> = {
  "24h": "the last 24 hours",
  "7d": "the last 7 days",
  "30d": "the last 30 days",
  all: "the archive",
};

export const SORT_LABEL: Record<FeedSort, string> = { top: "Top", latest: "Latest" };

/** Longer than any headline worth matching; keeps a pathological URL out of the SQL. */
const MAX_QUERY = 120;

/**
 * Normalise a search term. Whitespace-only is not a search, and the trimmed form is what the
 * URL, the input and the empty state all have to agree on — otherwise `?q=%20` renders a feed
 * that says it matched nothing for a term the reader can't see.
 */
export function parseQuery(value: string | null | undefined): string | undefined {
  const q = (value ?? "").replace(/\s+/g, " ").trim().slice(0, MAX_QUERY);
  return q || undefined;
}

/** Narrow an untrusted query string. Anything unrecognised falls back rather than 422ing upstream. */
export function parseSort(value: string | null | undefined): FeedSort {
  return SORTS.includes(value as FeedSort) ? (value as FeedSort) : DEFAULT_SORT;
}

export function parseWindow(value: string | null | undefined): FeedWindow {
  return WINDOWS.includes(value as FeedWindow) ? (value as FeedWindow) : DEFAULT_WINDOW;
}

export type FeedParams = {
  category?: string;
  tunisian?: boolean;
  /**
   * Free-text filter. Narrows the same feed rather than replacing it: the category, window and
   * sort all still apply, so `top` keeps meaning what it means everywhere else.
   */
  q?: string;
  sort?: FeedSort;
  window?: FeedWindow;
  /** ISO-8601. Omitted on the first page; echoed back on every later page. */
  asOf?: string;
  limit?: number;
  offset?: number;
};

export type FeedPage = {
  clusters: ClusterSummary[];
  /**
   * The clock the API scored against, from its `X-as-of` header. The score depends on it, so
   * paging without sending it back means every later page is scored a few seconds further on
   * and the ordering shifts under the reader mid-scroll.
   */
  asOf: string | null;
};

export async function getClusters(params: FeedParams): Promise<FeedPage> {
  const qs = new URLSearchParams();
  if (params.tunisian) qs.set("tunisian", "true");
  if (params.category) qs.set("category", params.category);
  if (params.q) qs.set("q", params.q);
  if (params.sort) qs.set("sort", params.sort);
  if (params.window) qs.set("window", params.window);
  if (params.asOf) qs.set("as_of", params.asOf);
  qs.set("limit", String(params.limit ?? 20));
  qs.set("offset", String(params.offset ?? 0));

  const res = await fetch(`${BASE}/clusters/?${qs.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`getClusters failed: ${res.status}`);
  }
  // FastAPI spells it `X-as-of`; Headers.get is case-insensitive, so this reads either way.
  return { clusters: await res.json(), asOf: res.headers.get("x-as-of") };
}

export async function getCluster(id: number): Promise<ClusterRead | null> {
  const res = await fetch(`${BASE}/clusters/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`getCluster failed: ${res.status}`);
  }
  return res.json();
}
