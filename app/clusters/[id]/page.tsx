import Link from "next/link";
import { notFound } from "next/navigation";
import { getCluster } from "@/lib/api";
import ClusterImage from "@/components/ClusterImage";
import CategoryBadge from "@/components/CategoryBadge";
import ArticleList from "@/components/ArticleList";
import ScoreReadout from "@/components/ScoreReadout";

export default async function ClusterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cluster = await getCluster(Number(id));
  if (!cluster) notFound();

  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link
        href="/"
        className="font-mono text-xs text-muted hover:text-ink"
      >
        ← Back to feed
      </Link>

      <div className="aspect-[16/9] w-full overflow-hidden rounded-xl border border-hairline bg-white/[0.04]">
        <ClusterImage src={cluster.image} alt={cluster.main_title} category={cluster.category} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <CategoryBadge category={cluster.category} asLink />
        {cluster.latest_published_at && (
          <time
            dateTime={cluster.latest_published_at}
            className="font-mono text-[11px] uppercase tracking-wide text-muted"
          >
            {new Date(cluster.latest_published_at).toLocaleString()}
          </time>
        )}
      </div>

      <h1 className="font-display text-3xl leading-tight text-ink sm:text-4xl">
        {cluster.main_title}
      </h1>

      {cluster.one_sentence_summary && (
        <p className="text-lg leading-relaxed text-ink/80">{cluster.one_sentence_summary}</p>
      )}

      {cluster.locations?.length > 0 && (
        <p className="font-mono text-xs uppercase tracking-wide text-muted">
          {cluster.locations.join(" · ")}
        </p>
      )}

      <ScoreReadout cluster={cluster} />

      <section className="border-t border-hairline pt-6">
        <h2 className="mb-4 font-mono text-xs uppercase tracking-widest text-muted">
          {cluster.articles.length} source{cluster.articles.length === 1 ? "" : "s"}
        </h2>
        <ArticleList articles={cluster.articles} />
      </section>
    </article>
  );
}
