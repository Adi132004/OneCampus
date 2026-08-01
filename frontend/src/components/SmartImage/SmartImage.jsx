import { useEffect, useState } from "react";

/**
 * <img> wrapper that:
 *  1. Keeps the displayed image in sync with the `src` prop — including when
 *     the parent re-renders with a new URL after an async data fetch.
 *  2. Falls back to a deterministic picsum photo if the primary URL fails to
 *     load (broken link, CORS error, etc.).
 *
 * Bug fixed: the original implementation used useState(src) which only reads
 * the initial prop value. If the parent fetched items asynchronously and then
 * passed a real Cloudinary URL as src, the <img> would continue to show
 * whatever src was on the first render (null / undefined), causing every card
 * to show the "No image added" placeholder even when an image existed.
 */
export function SmartImage({ src, fallbackSeed, alt = "", className, ...rest }) {
  const [current, setCurrent] = useState(src);

  // Sync whenever the parent passes a new src URL (e.g. after async fetch)
  useEffect(() => {
    if (src) setCurrent(src);
  }, [src]);

  return (
    <img
      {...rest}
      src={current}
      alt={alt}
      loading="lazy"
      className={className}
      onError={() => {
        const fb = `https://picsum.photos/seed/${encodeURIComponent(fallbackSeed)}/800/600`;
        if (current !== fb) setCurrent(fb);
      }}
    />
  );
}
