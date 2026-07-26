import { useEffect } from "react";

/**
 * Premium animated background. Two large glowing blobs (warm orange +
 * cool blue) drift in opposite directions as the user scrolls, crossing
 * each other to create a soft, alive glow that reads as one continuous
 * canvas behind every route.
 *
 * Performance:
 *   - Fixed positioning, `-z-10`, `pointer-events-none`.
 *   - Only CSS transforms drive motion (GPU accelerated, no layout).
 *   - Scroll writes coalesced through requestAnimationFrame.
 *   - `will-change: transform` hints the compositor.
 *   - Heavy blur is applied once via `filter: blur(...)`.
 */
export function ScrollGradient() {
  useEffect(() => {
    let raf = 0;
    const root = document.documentElement;
    const update = () => {
      const max = root.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      // Orange drifts left -> right and down, blue right -> left and up.
      // They meet in the middle roughly at 50% scroll, crossing naturally.
      const orangeX = -20 + p * 80; // vw
      const orangeY = -10 + p * 60; // vh
      const blueX = 30 - p * 80; // vw
      const blueY = 40 - p * 60; // vh
      root.style.setProperty("--blob-orange-x", `${orangeX.toFixed(2)}vw`);
      root.style.setProperty("--blob-orange-y", `${orangeY.toFixed(2)}vh`);
      root.style.setProperty("--blob-blue-x", `${blueX.toFixed(2)}vw`);
      root.style.setProperty("--blob-blue-y", `${blueY.toFixed(2)}vh`);
      raf = 0;
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, {
      passive: true,
    });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #faf1e5 0%, #f7efe3 34%, #f2efe9 58%, #eaf1ff 100%)",
      }}
    >
      {/* Warm orange glowing blob */}
      <div
        className="absolute motion-float"
        style={{
          top: "-20vh",
          left: "-15vw",
          width: "75vw",
          height: "75vh",
          borderRadius: "50%",
          background:
            "radial-gradient(closest-side, rgba(255, 114, 37, 0.42), rgba(255, 114, 37, 0) 72%)",
          filter: "blur(80px)",
          transform:
            "translate3d(var(--blob-orange-x, 0vw), var(--blob-orange-y, 0vh), 0)",
          transition: "transform 600ms cubic-bezier(0.2, 0.75, 0.18, 1)",
          willChange: "transform",
        }}
      />
      {/* Cool blue glowing blob */}
      <div
        className="absolute motion-float"
        style={{
          bottom: "-25vh",
          right: "-18vw",
          width: "80vw",
          height: "80vh",
          borderRadius: "50%",
          background:
            "radial-gradient(closest-side, rgba(79, 132, 255, 0.36), rgba(79, 132, 255, 0) 72%)",
          filter: "blur(90px)",
          transform:
            "translate3d(var(--blob-blue-x, 0vw), var(--blob-blue-y, 0vh), 0)",
          transition: "transform 600ms cubic-bezier(0.2, 0.75, 0.18, 1)",
          willChange: "transform",
          animationDelay: "-3.5s",
        }}
      />
    </div>
  );
}
