import Link from "next/link";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin } from "@phosphor-icons/react/dist/ssr";
import { getCluster } from "@/lib/api";
import { urgencyColor } from "@/lib/scoring";
import ClusterImage from "@/components/ClusterImage";
import CategoryBadge from "@/components/CategoryBadge";
import ArticleList from "@/components/ArticleList";
import ScoreReadout from "@/components/ScoreReadout";

const dateline = new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeStyle: "short" });

export default async function ClusterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cluster = await getCluster(Number(id));
  if (!cluster) notFound();

  const photo = Boolean(cluster.image);
  const style = { "--tone": urgencyColor(cluster.urgency) } as CSSProperties;

  return (
    <article className="flex flex-col gap-3" style={style}>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 self-start rounded-full bg-surface px-3.5 py-1.5 text-sm font-medium text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-[0.97]"
      >
        <ArrowLeft size={14} aria-hidden />
        Back to the feed
      </Link>

      <header
        className={`tile-in relative flex min-h-[24rem] flex-col justify-end overflow-hidden rounded-[20px] lg:min-h-[30rem] ${
          photo ? "" : "bg-[color-mix(in_oklab,var(--tone)_12%,var(--surface))]"
        }`}
      >
        {photo && (
          <>
            <div className="absolute inset-0">
              <ClusterImage src={cluster.image!} alt={cluster.main_title} priority />
            </div>
            <div
              aria-hidden
              className="absolute inset-0 bg-linear-to-t from-black/90 via-black/45 to-black/0"
            />
          </>
        )}
        <div className="relative flex max-w-[56rem] flex-col gap-4 p-6 sm:p-9">
          <div className="flex flex-wrap items-center gap-2.5">
            <CategoryBadge category={cluster.category} asLink inverse={photo} />
            {cluster.latest_published_at && (
              <time
                dateTime={cluster.latest_published_at}
                className={`text-xs ${photo ? "text-white/75" : "text-muted"}`}
              >
                Updated {dateline.format(new Date(cluster.latest_published_at))}
              </time>
            )}
          </div>
          <h1
            className={`text-balance font-display text-4xl font-bold leading-[1.04] tracking-tight sm:text-5xl ${
              photo ? "text-white" : ""
            }`}
          >
            {cluster.main_title}
          </h1>
          {cluster.one_sentence_summary && (
            <p
              className={`max-w-[62ch] text-lg leading-relaxed ${photo ? "text-white/85" : "text-ink/75"}`}
            >
              {cluster.one_sentence_summary}
            </p>
          )}
          {cluster.locations?.length > 0 && (
            <p
              className={`inline-flex items-center gap-1.5 text-sm ${photo ? "text-white/75" : "text-muted"}`}
            >
              <MapPin size={14} aria-hidden />
              {cluster.locations.join(", ")}
            </p>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <section
          className="tile-in rounded-[20px] bg-surface p-6 lg:col-span-2"
          style={{ "--i": 1 } as CSSProperties}
        >
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Coverage{" "}
            <span className="font-sans text-sm font-normal text-muted">
              {cluster.articles.length} {cluster.articles.length === 1 ? "article" : "articles"}
            </span>
          </h2>
          <ArticleList articles={cluster.articles} />
        </section>

        <aside style={{ "--i": 2 } as CSSProperties} className="tile-in">
          <ScoreReadout cluster={cluster} />
        </aside>
      </div>
    </article>
  );
}
