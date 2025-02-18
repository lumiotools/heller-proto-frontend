/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import MicButton from "../ui/mic-button";
import SpeakingAnimation from "../ui/speaking-animation";

export default function DemoPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SpeakingAnimation />
    </div>
  );
}
