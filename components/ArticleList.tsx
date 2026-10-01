import type { Article } from "@/lib/types";
import { isRedundantAuthor, sourceLabel } from "@/lib/sources";

export default function ArticleList({ articles }: { articles: Article[] }) {
  if (!articles.length) {
    return <p className="font-mono text-sm text-muted">No source articles.</p>;
  }
  return (
    <ul className="divide-y divide-hairline">
      {articles.map((a) => (
        // Title is omitted on purpose — the cluster headline above already says it.
        <li key={a.id} className="py-3">
          <a
            href={a.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-baseline gap-2 text-ink hover:text-accent"
            title={a.title}
          >
            <span className="font-medium">{sourceLabel(a.source)}</span>
            {!isRedundantAuthor(a.author, a.source) && (
              <span className="text-sm text-muted">{a.author}</span>
            )}
            <span className="font-mono text-[11px] text-muted opacity-0 transition-opacity group-hover:opacity-100">
              ↗
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
