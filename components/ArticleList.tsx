import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import type { Article } from "@/lib/types";
import { isRedundantAuthor, sourceLabel } from "@/lib/sources";

const stamp = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export default function ArticleList({ articles }: { articles: Article[] }) {
  if (!articles.length) {
    return <p className="mt-4 text-sm text-muted">No source articles.</p>;
  }
  return (
    <ul className="mt-4 flex flex-col gap-1.5">
      {articles.map((a) => (
        // Title is omitted on purpose: the cluster headline above already says it.
        <li key={a.id}>
          <a
            href={a.url}
            target="_blank"
            rel="noopener noreferrer"
            title={a.title}
            className="group flex items-center gap-3 rounded-2xl bg-surface-2/60 px-4 py-3 transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink font-display text-sm font-bold text-paper">
              {sourceLabel(a.source).charAt(0)}
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="font-medium text-ink">{sourceLabel(a.source)}</span>
              {!isRedundantAuthor(a.author, a.source) && (
                <span className="truncate text-xs text-muted">{a.author}</span>
              )}
            </span>
            <span className="ml-auto flex shrink-0 items-center gap-2 text-xs tabular-nums text-muted">
              {a.published_at && (
                <time dateTime={a.published_at}>{stamp.format(new Date(a.published_at))}</time>
              )}
              <ArrowUpRight
                size={16}
                aria-hidden
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
              />
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
