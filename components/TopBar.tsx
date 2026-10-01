import { Suspense } from "react";
import Link from "next/link";
import CategoryBar from "./CategoryBar";
import FeedControls from "./FeedControls";
import SearchBar from "./SearchBar";

export default function TopBar() {
  return (
    <header className="sticky top-0 z-10 border-b border-hairline bg-paper/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="font-display text-xl font-semibold tracking-tight text-ink">
              The Cluster
            </span>
            <span className="hidden font-mono text-[11px] uppercase tracking-widest text-muted sm:inline">
              news, grouped
            </span>
          </Link>
          <div className="w-full sm:w-72">
            <Suspense fallback={null}>
              <SearchBar />
            </Suspense>
          </div>
        </div>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Suspense fallback={null}>
            <CategoryBar />
          </Suspense>
          <Suspense fallback={null}>
            <FeedControls />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
