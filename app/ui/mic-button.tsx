"use client";

import { Mic, Sparkle } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export default function MicButton() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      className="relative w-48 h-48 rounded-full flex items-center justify-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
    >
      {/* Outer blue ring with shadow */}
      <div className="absolute inset-0 rounded-full border-4 border-sky-400 shadow-[0_0_0_2px_rgba(0,0,0,0.05)]" />

      {/* Gap */}
      <div className="absolute inset-[6px] rounded-full bg-gray-50" />

      {/* Inner button group with shadow */}
      <div className="absolute inset-[10px] rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.1)]">
        {/* Thick blue ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-sky-400 to-sky-500" />

        {/* White center */}
        <div className="absolute inset-[16px] rounded-full bg-white" />
      </div>

      {/* Sparkles */}
      {isHovered && (
        <>
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute top-14 left-14 text-sky-400"
          >
            <Sparkle size={22} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
            className="absolute bottom-14 right-14 text-sky-400"
          >
            <Sparkle size={22} />
          </motion.div>
        </>
      )}

      {/* Microphone Icon */}
      <motion.div
        initial={false}
        animate={{
          scale: isHovered ? 1.1 : 1,
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative z-10"
      >
        {isHovered ? (
          <svg
            viewBox="0 0 24 24"
            className="w-20 h-20 text-sky-400"
            fill="currentColor"
            stroke="none"
          >
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
          </svg>
        ) : (
          <Mic className="w-20 h-20 text-sky-400 stroke-[1.25]" />
        )}
      </motion.div>
    </motion.button>
  );
}
