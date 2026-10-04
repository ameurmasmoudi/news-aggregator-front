const TILE = "rounded-[20px] bg-surface motion-safe:animate-pulse";

/** The first bento block, empty: same cells the feed is about to fill. */
export default function Loading() {
  return (
    <div
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:auto-rows-[16.5rem] lg:grid-cols-4"
      aria-busy
      aria-label="Loading stories"
    >
      <div className={`${TILE} min-h-[26rem] sm:col-span-2 lg:col-span-2 lg:row-span-2`} />
      <div className={`${TILE} min-h-44`} />
      <div className={`${TILE} min-h-44`} />
      <div className={`${TILE} min-h-44 sm:col-span-2 lg:col-span-2`} />
      <div className={`${TILE} min-h-44 lg:row-span-2`} />
      <div className={`${TILE} min-h-44`} />
      <div className={`${TILE} min-h-44`} />
      <div className={`${TILE} min-h-44`} />
      <div className={`${TILE} min-h-44 sm:col-span-2 lg:col-span-3`} />
    </div>
  );
}
