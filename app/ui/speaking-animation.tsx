"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function SpeakingAnimation() {
  const [animationState, setAnimationState] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationState((prev) => (prev + 1) % 5);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const getHeight = (index: number) => {
    const heights = [8, 32, 16, 24, 8];
    return heights[(animationState + index) % 5];
  };

  return (
    <div className="relative w-48 h-48">
      {/* Outer blue ring */}
      <div className="absolute inset-0 rounded-full border-4 border-sky-400 shadow-[0_0_0_2px_rgba(0,0,0,0.05)]" />

      {/* Gap */}
      <div className="absolute inset-[6px] rounded-full bg-gray-50" />

      {/* Inner button group with shadow */}
      <div className="absolute inset-[10px] rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.1)]">
        {/* Thick blue ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-sky-400 to-sky-500" />

        {/* Additional border ring */}
        <div className="absolute inset-[18px] rounded-full bg-white border-[3px] border-[#0083BF] shadow-[0_10px_6px_rgba(1,26,46,0.18)]" />
        {/* White center */}
        <div className="absolute inset-[21px] rounded-full bg-white flex items-center justify-center">
          <div className="flex gap-3 h-8 items-center">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="bg-[#39B4FF] rounded-full w-2"
                animate={{ height: getHeight(i) }}
                transition={{
                  duration: 0.5,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
