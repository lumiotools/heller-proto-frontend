"use client";

import { useEffect, useState, useRef } from "react";
import { Mic, Speaker } from "lucide-react";

// Types
type CallStatus = "idle" | "active";
type AIState = "idle" | "speaking" | "listening" | "active";

interface VapiSDK {
  run: (config: VapiConfig) => VapiInstance;
}

interface VapiConfig {
  apiKey: string;
  assistant: string;
  dailyConfig: {
    dailyJsVersion: string;
  };
}

interface VapiInstance {
  on: (event: string, callback: (message?: VapiMessage) => void) => void;
}

interface VapiMessage {
  type: string;
  transcript?: string;
  speech?: string;
}

interface Subtitle {
  text: string;
  timestamp: number;
  speaker: "ai" | "user";
}

// Declare global window type
declare global {
  interface Window {
    vapiSDK: VapiSDK;
  }
}

class Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  canvasWidth: number;
  canvasHeight: number;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight;
    this.size = Math.random() * 2 + 0.5;
    this.speedX = Math.random() * 1 - 0.5;
    this.speedY = Math.random() * 1 - 0.5;
  }

  update(): void {
    this.x += this.speedX;
    this.y += this.speedY;

    if (this.x < 0 || this.x > this.canvasWidth) this.speedX *= -1;
    if (this.y < 0 || this.y > this.canvasHeight) this.speedY *= -1;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "rgba(0, 255, 255, 0.5)";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }
}

const Page = () => {
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [aiState, setAiState] = useState<AIState>("idle");
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const subtitlesRef = useRef<HTMLDivElement>(null);

  // Auto-scroll effect for subtitles
  useEffect(() => {
    if (subtitlesRef.current) {
      subtitlesRef.current.scrollTop = subtitlesRef.current.scrollHeight;
    }
  }, [subtitles]);

  useEffect(() => {
    let vapiInstance: VapiInstance | null = null;
    const assistant = "01daf59f-62be-4edd-b6e9-dd2b9efda5a8";
    const apiKey = "9ed68d2a-e0fc-4632-9c4f-3452af3de262";

    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/gh/VapiAI/html-script-tag@latest/dist/assets/index.js";
    script.defer = true;
    script.async = true;
    document.body.appendChild(script);

    const handleScriptLoad = () => {
      vapiInstance = window.vapiSDK.run({
        apiKey,
        assistant,
        dailyConfig: {
          dailyJsVersion: "0.47.0",
        },
      });

      vapiInstance.on("speech-start", () => setAiState("speaking"));
      vapiInstance.on("speech-end", () => setAiState("active"));
      vapiInstance.on("call-start", () => {
        setCallStatus("active");
        setAiState("active");
      });
      vapiInstance.on("call-end", () => {
        setCallStatus("idle");
        setAiState("idle");
        setSubtitles([]);
      });
      vapiInstance.on("message", (message?: VapiMessage) => {
        if (message?.type === "transcript" && message.transcript) {
          setAiState("listening");
          setSubtitles((prev) => [
            ...prev,
            {
              text: message.transcript!,
              timestamp: Date.now(),
              speaker: "user",
            },
          ]);
          setTimeout(() => setAiState("active"), 1000);
        } else if (message?.type === "speech" && message.speech) {
          setAiState("speaking");
          setSubtitles((prev) => [
            ...prev,
            { text: message.speech!, timestamp: Date.now(), speaker: "ai" },
          ]);
        }
      });
    };

    script.addEventListener("load", handleScriptLoad);

    return () => {
      script.removeEventListener("load", handleScriptLoad);

      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      // Clean up Vapi button
      const vapiButton = document.querySelector(".vapi-btn");
      if (vapiButton) {
        vapiButton.remove();
      }
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const particles: Particle[] = [];
    const particleCount = 100;
    let animationFrameId: number;

    const createParticles = () => {
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(canvas.width, canvas.height));
      }
    };

    const animateParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((particle) => {
        particle.update();
        particle.draw(ctx);
      });
      animationFrameId = requestAnimationFrame(animateParticles);
    };

    createParticles();
    animateParticles();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const getStateColor = () => {
    const colors = {
      speaking: "bg-green-400",
      listening: "bg-blue-400",
      active: "bg-yellow-400",
      idle: "bg-gray-400",
    };
    return colors[aiState];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-6xl font-bold mb-12 text-cyan-300">
        Heller AI Agent
      </h1>

      <div className="relative w-64 h-64 mb-12">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          width={256}
          height={256}
        />
        <div
          className={`absolute inset-0 rounded-full border-2 ${
            callStatus === "active" ? "border-cyan-400" : "border-cyan-600"
          } flex items-center justify-center transition-all duration-500`}
        >
          <div
            className={`w-56 h-56 rounded-full ${
              callStatus === "active"
                ? "bg-cyan-400 bg-opacity-10"
                : "bg-transparent"
            } flex items-center justify-center transition-all duration-500`}
          >
            {callStatus === "active" && (
              <div className="relative">
                <div
                  className={`w-12 h-12 ${getStateColor()} rounded-full opacity-50 animate-pulse`}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  {aiState === "speaking" && (
                    <Speaker className="w-6 h-6 text-white" />
                  )}
                  {aiState === "listening" && (
                    <Mic className="w-6 h-6 text-white" />
                  )}
                  {aiState === "active" && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="text-center space-y-4 mb-8">
        <p className="text-2xl font-medium text-cyan-200">
          {callStatus === "idle" && "Heller AI is ready"}
          {callStatus === "active" &&
            aiState === "speaking" &&
            "Heller AI is speaking"}
          {callStatus === "active" &&
            aiState === "listening" &&
            "Heller AI is listening"}
          {callStatus === "active" &&
            aiState === "active" &&
            "Heller AI is active"}
        </p>
        <p className="text-lg text-gray-400">Share your knowledge with us</p>
      </div>

      {callStatus === "active" && (
        <div
          ref={subtitlesRef}
          className="w-full max-w-2xl h-48 overflow-y-auto bg-gray-800 bg-opacity-50 rounded-lg p-4 space-y-2 scroll-smooth"
        >
          {subtitles.map((subtitle, index) => (
            <div
              key={`${subtitle.timestamp}-${index}`}
              className={`p-2 rounded-lg ${
                subtitle.speaker === "ai" ? "bg-cyan-500" : "bg-blue-500"
              } bg-opacity-50 text-center`}
            >
              {subtitle.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Page;
