import { getClusters, parseQuery, parseSort, parseWindow } from "@/lib/api";
import { clockFrom } from "@/lib/scoring";
import Feed from "@/components/Feed";

const LIMIT = 18;

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    tunisian?: string;
    q?: string;
    sort?: string;
    window?: string;
  }>;
}) {
  const sp = await searchParams;
  const tunisian = sp.tunisian === "true";
  const category = tunisian ? undefined : sp.category;
  const q = parseQuery(sp.q);
  const sort = parseSort(sp.sort);
  const feedWindow = parseWindow(sp.window);

  // No `as_of` on the first page: the API stamps the clock it used and hands it back, and
  // every later page pins that same value so the ordering can't shift mid-scroll.
  const { clusters, asOf } = await getClusters({
    category,
    tunisian,
    q,
    sort,
    window: feedWindow,
    limit: LIMIT,
    offset: 0,
  });
  const now = clockFrom(asOf);

  // key remounts the client Feed when the query changes, resetting its paging state.
  return (
    <Feed
      key={[tunisian ? "tunisia" : (category ?? "all"), q ?? "", sort, feedWindow].join(":")}
      initial={clusters}
      category={category}
      tunisian={tunisian}
      q={q}
      sort={sort}
      window={feedWindow}
      asOf={asOf}
      now={now}
    />
  );
}
