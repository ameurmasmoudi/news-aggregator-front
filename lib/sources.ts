/**
 * Feed identifiers, as the ingest writes them, mapped to how each outlet writes its own name.
 *
 * The ingest is not consistent about this — the four live feeds arrive as `al jazeera`,
 * `France24`, `bbc_world` and `kapitalis`, three different conventions between them. Rendering
 * those raw gives a card footer reading `AL JAZEERA · BBC_WORLD · FRANCE24`, which looks like a
 * config file rather than a byline.
 *
 * Keys are lowercased before lookup, so a feed later renamed `France 24` or `BBC_World` still
 * resolves. That matters: the backend's Tunisia filter matches these strings exactly
 * (`sources.overlap(["kapitalis", "nawaat"])`), so the raw values are load-bearing there and
 * cannot be normalised at the source without touching that filter — see
 * docs/backend-search-note.md.
 */
const SOURCE_LABELS: Record<string, string> = {
  "al jazeera": "Al Jazeera",
  aljazeera: "Al Jazeera",
  france24: "France 24",
  "france 24": "France 24",
  bbc_world: "BBC",
  bbc: "BBC",
  kapitalis: "Kapitalis",
  nawaat: "Nawaat",
  "the guardian": "The Guardian",
  guardian: "The Guardian",
};

/** Letters and digits only, lowercased — `FRANCE 24`, `France24` and `france_24` all collapse. */
function fold(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Whether an article's `author` is just its outlet restating itself.
 *
 * Most feeds put a real byline here, but France 24 sends `FRANCE24` or `FRANCE 24` on 45 of its
 * articles, which renders as "France 24  FRANCE24" — the outlet twice on one line. Comparison is
 * deliberately strict equality after folding: it catches the outlet-as-byline case without
 * guessing about house bylines like `Guardian Staff` or `webmaster kapitalis`, which are noisy
 * but are at least saying something the source name doesn't.
 */
export function isRedundantAuthor(author: string | null, source: string): boolean {
  if (!author) return true;
  const a = fold(author);
  if (!a) return true;
  return a === fold(source) || a === fold(sourceLabel(source));
}

/**
 * Display name for a feed identifier. An unknown feed is title-cased rather than dropped —
 * a new outlet should look slightly generic, never leak `some_new_feed` into the UI, and never
 * disappear from a card that genuinely has it.
 */
export function sourceLabel(source: string): string {
  const key = source.trim().toLowerCase();
  if (!key) return "";
  const known = SOURCE_LABELS[key];
  if (known) return known;
  return key
    .replace(/[_-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}
