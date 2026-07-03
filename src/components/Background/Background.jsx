import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import "./Background.css";

export default function Background() {
  const { scrollYProgress } = useScroll();

  // Scroll-driven translations (pixels) — slow, subtle motion toward center and past
  const orangeX = useTransform(scrollYProgress, [0, 0.5, 1], [-220, 0, 220]);
  const orangeY = useTransform(scrollYProgress, [0, 0.5, 1], [-220, 0, 220]);

  const blueX = useTransform(scrollYProgress, [0, 0.5, 1], [220, 0, -220]);
  const blueY = useTransform(scrollYProgress, [0, 0.5, 1], [220, 0, -220]);

  const idleTransition = {
    repeat: Infinity,
    ease: "easeInOut",
  };

  return (
    <div className="site-background" aria-hidden>
      <motion.div
        className="blob blob--orange"
        style={{ x: orangeX, y: orangeY }}
        animate={{ rotate: [ -5, 5, -5 ], scale: [1, 1.04, 1] }}
        transition={{ ...idleTransition, duration: 22 }}
      />

      <motion.div
        className="blob blob--blue"
        style={{ x: blueX, y: blueY }}
        animate={{ rotate: [ 5, -5, 5 ], scale: [1, 1.03, 1] }}
        transition={{ ...idleTransition, duration: 19 }}
      />
    </div>
  );
}
