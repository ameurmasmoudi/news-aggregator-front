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
    // Always land on the feed — chips are filters, not page-local state.
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
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <Chip active={isAll} onClick={() => selectCategory(null)}>
        All
      </Chip>
      <Chip active={activeTunisia} onClick={selectTunisia}>
        Tunisia
      </Chip>
      {CATEGORIES.map((c) => (
        <Chip key={c} active={activeCategory === c} onClick={() => selectCategory(c)}>
          {c}
        </Chip>
      ))}
    </div>
  );
}

function Chip({
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
      className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-widest transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
        active
          ? "border-ink bg-ink text-paper"
          : "border-hairline bg-surface text-muted hover:border-ink/40 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
