import type { Category } from "./types";

// Order is the order of the filter chips. Mirrors the prompt's category enum
// (docs/backend-prompt-note.md) — a value the model can emit but this list omits is unfilterable.
export const CATEGORIES: Category[] = [
  "politics", "economy", "technology", "science",
  "environment", "health", "conflict", "society",
];

// Categories carry no colour of their own: colour on a card means urgency (lib/scoring.ts).
// Tunisia is not a backend category — it is a filter (?tunisian=true) surfaced as its own chip.
