"use client";

import MicButton from "./mic-button";
import SpeakingAnimation from "./speaking-animation";

interface CallButtonProps {
  aiState: "idle" | "speaking" | "listening" | "active";
}

export const CallButtonSvg = ({ aiState }: CallButtonProps) => (
  <div className="w-full h-full pointer-events-none">
    {aiState === "speaking" || aiState === "listening" ? (
      <SpeakingAnimation />
    ) : (
      <MicButton />
    )}
  </div>
);
