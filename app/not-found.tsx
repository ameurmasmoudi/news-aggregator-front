import Link from "next/link";
export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <p className="font-display text-xl text-ink">Cluster not found.</p>
      <Link href="/" className="mt-4 inline-block font-mono text-xs text-muted hover:text-ink">
        ← Back to feed
      </Link>
    </div>
  );
}
