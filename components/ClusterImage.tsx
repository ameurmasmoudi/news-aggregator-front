export default function ClusterImage({
  src,
  alt,
  category,
}: {
  src: string | null;
  alt: string;
  category: string | null;
}) {
  if (src) {
    // plain <img>: RSS/OG images are arbitrary external hosts, avoids next.config image allowlist
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className="h-full w-full object-cover" />;
  }
  // Fallback: a quiet neutral field carrying the category label. No colour — on a card,
  // colour means urgency, and a missing image says nothing about urgency.
  return (
    <div className="flex h-full w-full items-center justify-center bg-white/[0.04]">
      <span className="font-mono text-[11px] uppercase tracking-widest text-muted">
        {category ?? "news"}
      </span>
    </div>
  );
}
