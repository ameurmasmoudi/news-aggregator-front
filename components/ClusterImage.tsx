"use client";
import { useState } from "react";

/**
 * Callers only render this when the cluster has an image. Feed images are hotlinked from
 * arbitrary outlets and some of them 404 or refuse hotlinking, so a failed load swaps to a wash
 * of the tile's urgency tone (`--tone`, set by the tile) instead of leaving a blank hole.
 */
export default function ClusterImage({
  src,
  alt,
  priority = false,
}: {
  src: string;
  alt: string;
  /** The lead photo is the page's largest paint; everything else can wait for the viewport. */
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        aria-hidden
        className="h-full w-full bg-[radial-gradient(120%_90%_at_20%_10%,color-mix(in_oklab,var(--tone,var(--muted))_35%,var(--surface-2)),var(--surface-2))]"
      />
    );
  }

  // plain <img>: RSS/OG images are arbitrary external hosts, avoids next.config image allowlist
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      onError={() => setFailed(true)}
      className="h-full w-full object-cover"
    />
  );
}
