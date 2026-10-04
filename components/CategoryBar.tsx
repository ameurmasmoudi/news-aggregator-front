"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";

export default function CategoryBar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  // Filters only exist on the feed; off it (e.g. /clusters/[id]) nothing is active.
  const onFeed = pathname === "/";
  const activeCategory = onFeed ? params.get("category") : null;
  const activeTunisia = onFeed && params.get("tunisian") === "true";

  function go(next: URLSearchParams) {
    next.delete("offset");
    const qs = next.toString();
    // Always land on the feed: tabs are filters, not page-local state.
    router.push(qs ? `/?${qs}` : "/");
  }

  function selectCategory(cat: string | null) {
    const next = new URLSearchParams(params.toString());
    next.delete("tunisian");
    if (cat) next.set("category", cat);
    else next.delete("category");
    go(next);
  }

  function selectTunisia() {
    const next = new URLSearchParams(params.toString());
    next.delete("category");
    next.set("tunisian", "true");
    go(next);
  }

  const isAll = onFeed && !activeCategory && !activeTunisia;

  return (
    <div className="-mx-3 flex items-center gap-1.5 overflow-x-auto px-3 [scrollbar-width:none] sm:-mx-5 sm:px-5 lg:mx-0 lg:flex-wrap lg:px-0 [&::-webkit-scrollbar]:hidden">
      <Tab active={isAll} onClick={() => selectCategory(null)}>
        All
      </Tab>
      <Tab active={activeTunisia} onClick={selectTunisia}>
        Tunisia
      </Tab>
      {/* Tunisia is a region filter, the rest are topics: a rule keeps them from reading as one list. */}
      <span aria-hidden className="mx-1 h-5 w-px shrink-0 bg-hairline" />
      {CATEGORIES.map((c) => (
        <Tab key={c} active={activeCategory === c} onClick={() => selectCategory(c)}>
          {c}
        </Tab>
      ))}
    </div>
  );
}

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium capitalize transition-[background-color,color,transform] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-[0.96] ${
        active ? "bg-ink text-paper" : "bg-surface text-muted hover:bg-surface-2 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
