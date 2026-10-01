"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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
      <svg
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        ref={input}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && e.currentTarget.blur()}
        placeholder="Search headlines…"
        aria-label="Search clusters"
        className="w-full rounded-full border border-hairline bg-surface py-1.5 pl-9 pr-10 text-sm text-ink placeholder:text-muted focus:border-accent/60 focus:outline-none"
      />
      {urlQuery ? (
        <button
          type="button"
          onClick={clear}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-muted transition-colors hover:bg-white/[0.06] hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      ) : (
        <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-hairline px-1.5 font-mono text-[10px] text-muted">
          /
        </kbd>
      )}
    </form>
  );
}
