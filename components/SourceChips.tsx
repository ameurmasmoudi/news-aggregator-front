import { sourceLabel } from "@/lib/sources";

export default function SourceChips({ sources }: { sources: string[] }) {
  // Feed slugs are not names — see lib/sources.ts. Deduplicated because two identifiers can
  // map to one outlet, and "BBC · BBC" reads as a bug.
  const labels = [...new Set((sources ?? []).map(sourceLabel).filter(Boolean))];
  if (!labels.length) return null;

  return (
    <div className="flex flex-wrap gap-x-1.5 gap-y-0.5 font-mono text-[11px] text-muted">
      {labels.map((label, i) => (
        <span key={label}>
          {label}
          {i < labels.length - 1 && <span className="ml-1.5 text-muted/50">·</span>}
        </span>
      ))}
    </div>
  );
}
