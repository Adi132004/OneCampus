import { useState } from "react";

/**
 * <img> wrapper that falls back to a deterministic picsum photo if the
 * primary URL fails to load. Keeps the marketplace and lost-and-found
 * grids from ever showing broken placeholders.
 */
export function SmartImage({ src, fallbackSeed, alt = "", className, ...rest }) {
  const [current, setCurrent] = useState(src);
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
