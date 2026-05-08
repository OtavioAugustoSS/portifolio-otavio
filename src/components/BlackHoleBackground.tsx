"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function BlackHoleBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      className="fixed top-[-10%] md:top-[-30%] lg:top-[-40%] left-0 w-full z-[-10] flex justify-center pointer-events-none select-none"
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        className="w-full h-auto min-w-[150vw] md:min-w-[800px] object-cover mix-blend-screen"
        style={{
          WebkitMaskImage: 'radial-gradient(circle, black 30%, transparent 80%)',
          maskImage: 'radial-gradient(circle, black 30%, transparent 80%)'
        }}
      >
        <source src="/blackhole.webm" type="video/webm" />
        <source src="/blackhole.mp4" type="video/mp4" />
      </video>
    </motion.div>
  );
}
