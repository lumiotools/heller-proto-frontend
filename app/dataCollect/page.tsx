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
  role?: string;
  transcriptType?: string;
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const Page = () => {
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [aiState, setAiState] = useState<AIState>("idle");
  const [analysisQuestions, setAnalysisQuestions] = useState<string[]>([]);
  const transcriptRef = useRef<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
        transcriptRef.current = "";

        // Set up logging interval
        logIntervalRef.current = setInterval(async () => {
          if (transcriptRef.current.length > 0) {
            console.log("Current Transcript:", transcriptRef.current);
            try {
              const response = await fetch(
                `${API_URL}/data3/analyze-transcript`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ transcript: transcriptRef.current }),
                }
              );

              const data = await response.json();
              console.log("Analysis Response:", data);
              if (data.answered_questions) {
                const questionList = data.answered_questions
                  .split("\\n\\n")
                  .filter((q: string) => q.trim().length > 0);
                setAnalysisQuestions(questionList);
              }
            } catch (error) {
              console.error("Error sending transcript to API:", error);
            }
          }
        }, 30000);
      });

      vapiInstance.on("call-end", () => {
        setCallStatus("idle");
        setAiState("idle");

        if (logIntervalRef.current) {
          clearInterval(logIntervalRef.current);
          logIntervalRef.current = null;
        }
        transcriptRef.current = "";
      });

      vapiInstance.on("message", (message?: VapiMessage) => {
        console.log("message ", message);
        if (message?.type === "transcript" && message.transcript) {
          setAiState("listening");
          // Only append transcript when role is user
          if (message.role === "user") {
            transcriptRef.current += message.transcript;
          }
          setTimeout(() => setAiState("active"), 1000);
        } else if (message?.type === "speech" && message.speech) {
          setAiState("speaking");
          transcriptRef.current += "\nAI: " + message.speech;
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

      {/* Analysis Questions Display */}
      {analysisQuestions.length > 0 && (
        <div className="w-full max-w-2xl mt-8">
          <div className="bg-gray-800 rounded-lg p-4 h-64 overflow-y-auto">
            <h2 className="text-xl font-semibold text-cyan-300 mb-4">
              Analysis Results
            </h2>
            <div className="space-y-4">
              {analysisQuestions.map((question, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-700 rounded-lg text-white"
                >
                  {question}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
