import { Suspense } from "react";
import Link from "next/link";
import CategoryBar from "./CategoryBar";
import FeedControls from "./FeedControls";
import SearchBar from "./SearchBar";

export default function TopBar() {
  return (
    <header className="sticky top-0 z-10 border-b border-hairline/70 bg-paper/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-3 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <span
              aria-hidden
              className="grid h-8 w-8 place-items-center rounded-full bg-ink font-display text-sm font-bold text-paper"
            >
              C
            </span>
            <span className="font-display text-xl font-bold tracking-tight">The Cluster</span>
          </Link>
          <div className="ml-auto w-full max-w-xs">
            <Suspense fallback={null}>
              <SearchBar />
            </Suspense>
          </div>
        </div>
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
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
