import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";

export default function NotFound() {
  return (
    <div className="flex min-h-72 flex-col items-start justify-end gap-4 rounded-[20px] bg-surface p-7">
      <p className="font-display text-2xl font-semibold tracking-tight">This story isn&apos;t here.</p>
      <p className="max-w-[50ch] text-sm leading-relaxed text-muted">
        It may have been merged into another cluster, or the link is wrong.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper transition-transform hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-[0.97]"
      >
        <ArrowLeft size={14} aria-hidden />
        Back to the feed
      </Link>
    </div>
  );
}
