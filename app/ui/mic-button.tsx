"use client";

import { Mic, Sparkle } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export default function MicButton({ onClick }: { onClick?: () => void }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      className="relative w-48 h-48 rounded-full flex items-center justify-center cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      onClick={onClick} // Added onClick event here
    >
      {/* Outer blue ring with shadow */}
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
        <div className="absolute inset-[21px] rounded-full bg-white" />
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
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="#00AFFF"
            width="70"
            height="70"
          >
            <path d="M12 14c2.21 0 4-1.79 4-4V5c0-2.21-1.79-4-4-4S8 2.79 8 5v5c0 2.21 1.79 4 4 4zm6-4c0 3.31-2.69 6-6 6s-6-2.69-6-6H4c0 4.08 3.06 7.44 7 7.93V22h2v-4.07c3.94-.49 7-3.85 7-7.93h-2z" />
          </svg>
        ) : (
          <Mic className="w-20 h-20 text-sky-400 stroke-[1.25]" />
        )}
      </motion.div>
    </motion.button>
  );
}
