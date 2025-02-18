"use client";

import { motion } from "framer-motion";

export default function ListeningIndicator() {
  return (
    <div className="relative w-48 h-48 rounded-full flex items-center justify-center">
      {/* Outer ring */}
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
        <div className="absolute inset-[21px] rounded-full bg-white">
          <div className="absolute inset-0 flex items-center justify-center gap-3">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="w-3 h-3 rounded-full bg-sky-500"
                animate={{
                  y: ["0%", "-30%", "0%"],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: index * 0.2,
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
