import { useState, useEffect } from "react";

/**
 * <img> wrapper that falls back to a deterministic picsum photo if the
 * primary URL fails to load or is empty. Synchronizes with prop updates
 * so asynchronously loaded React Query image URLs render properly.
 */
export function SmartImage({ src, fallbackSeed, alt = "", className, ...rest }) {
  const fallback = fallbackSeed
    ? `https://picsum.photos/seed/${encodeURIComponent(fallbackSeed)}/800/600`
    : "";

  const [imgSrc, setImgSrc] = useState(src || fallback);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (src) {
      setImgSrc(src);
      setFailed(false);
    } else if (fallback) {
      setImgSrc(fallback);
    }
  }, [src, fallback]);

  return (
    <img
      {...rest}
      src={imgSrc}
      alt={alt}
      loading="lazy"
      className={className}
      onError={() => {
        if (!failed && fallback && imgSrc !== fallback) {
          setFailed(true);
          setImgSrc(fallback);
        }
      }}
    />
  );
}
