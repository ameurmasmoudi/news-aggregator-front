"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MagnifyingGlass, X } from "@phosphor-icons/react";

export default function SearchBar() {
  const router = useRouter();
  const params = useSearchParams();
  const urlQuery = params.get("q") ?? "";
  const [q, setQ] = useState(urlQuery);
  const input = useRef<HTMLInputElement | null>(null);

  // Follow the URL when something else moves it — a category chip, the back button, or the
  // trimmed term the submit itself pushed. The URL is the state; the input only mirrors it.
  useEffect(() => setQ(urlQuery), [urlQuery]);

  function go(term: string) {
    const next = new URLSearchParams(params.toString());
    const trimmed = term.replace(/\s+/g, " ").trim();
    if (trimmed) next.set("q", trimmed);
    else next.delete("q");
    next.delete("offset");
    // Always lands on the feed: search is a feed filter, not page-local state. Every other
    // param rides along untouched, so a search narrows the category and window already chosen.
    const qs = next.toString();
    router.push(qs ? `/?${qs}` : "/");
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    go(q);
  }

  function clear() {
    setQ("");
    go("");
    input.current?.focus();
  }

  // "/" focuses search, Escape leaves it — the pair that makes a keyboard feed usable.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable)
        return;
      event.preventDefault();
      input.current?.focus();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <form onSubmit={submit} role="search" className="relative">
      <MagnifyingGlass
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        aria-hidden
      />
      <input
        ref={input}
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && e.currentTarget.blur()}
        placeholder="Search headlines"
        aria-label="Search stories"
        className="w-full rounded-full border border-transparent bg-surface py-2 pl-9 pr-10 text-sm text-ink placeholder:text-muted transition-colors focus:border-ink/40 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {urlQuery ? (
        <button
          type="button"
          onClick={clear}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:bg-surface-2 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-ink"
        >
          <X size={14} aria-hidden />
        </button>
      ) : (
        <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-hairline px-1.5 font-mono text-[11px] text-muted">
          /
        </kbd>
      )}
    </form>
  );
}
