/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState, useRef } from "react";
import { Sparkles } from "lucide-react";
import { CallButtonSvg } from "../ui/call-button";
import { Button } from "@/components/ui/button";

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

declare global {
  interface Window {
    vapiSDK: VapiSDK;
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const Page = () => {
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [aiState, setAiState] = useState<AIState>("idle");
  const [analysisQuestions, setAnalysisQuestions] = useState<string[]>([]);
  const vapiButtonRef = useRef<HTMLButtonElement | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [userTranscript, setUserTranscript] = useState<string>("");
  const transcriptRef = useRef<string>("");
  const logIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
      setTimeout(() => {
        const vapiButton = document.querySelector(
          ".vapi-btn"
        ) as HTMLButtonElement;
        if (vapiButton) {
          vapiButtonRef.current = vapiButton;
          const buttonContainer = document.querySelector(
            "#vapi-button-container"
          );
          if (buttonContainer) {
            buttonContainer.appendChild(vapiButton);
          }
        }
      }, 1000);

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
        setIsLoading(false);

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
        setIsLoading(false);

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
  }, [callStatus]);

  const handleStartClick = () => {
    setIsLoading(true);

    if (vapiButtonRef.current) {
      vapiButtonRef.current.click();
    }
  };

  const handleEndClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      if (vapiButtonRef.current) {
        vapiButtonRef.current.click();
      }
    }, 400);
  };

  const handleResetClick = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#E6F3F9] flex flex-col items-center justify-center p-8">
      <div className="text-center space-y-3 mb-16">
        <h1 className="text-3xl font-medium text-[#004869]">Heller&apos;s</h1>
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-[#0083BF]" />
          <h2 className="text-6xl font-bold text-[#0083BF]">AI Agent</h2>
        </div>
      </div>

      <div className="text-center mb-12">
        <p className="text-2xl font-normal text-[#004869]">
          Heller AI is{" "}
          <span className="text-[#0083BF]">
            {callStatus === "idle" && "ready"}
            {callStatus === "active" && aiState === "speaking" && "speaking"}
            {callStatus === "active" && aiState === "listening" && "listening"}
            {callStatus === "active" && aiState === "active" && "active"}
          </span>
        </p>
      </div>

      <div
        id="vapi-button-container"
        className="relative w-[240px] h-[240px] mb-8"
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <CallButtonSvg aiState={aiState} />
        </div>
      </div>

      <div className="flex gap-4">
        {callStatus === "idle" ? (
          <Button
            onClick={handleStartClick}
            className="bg-[#0083BF] hover:bg-[#006699] text-white font-medium px-8 py-2 rounded-md"
            disabled={isLoading}
          >
            {isLoading ? "Starting..." : "Start Heller Talk"}
          </Button>
        ) : (
          <>
            <Button
              onClick={handleEndClick}
              className="bg-[#0083BF] hover:bg-[#006699] text-white font-medium px-8 py-2 rounded-md"
              disabled={isLoading}
            >
              {isLoading ? "Ending..." : "End Heller Talk"}
            </Button>
            <Button
              onClick={handleResetClick}
              variant="outline"
              className="border-[#0083BF] text-[#0083BF] hover:bg-[#0083BF]/10"
              disabled={isLoading}
            >
              Reset Heller Talk
            </Button>
          </>
        )}
      </div>

      {analysisQuestions.length > 0 && (
        <div className="text-center space-y-2 mt-8">
          <p className="text-xl text-[#004869]">You are Discussing</p>
          <div className="inline-block px-4 py-2 rounded-lg">
            <p className="text-[#004869]">{analysisQuestions[0]}</p>
          </div>
        </div>
      )}

      <style jsx global>{`
        #vapi-button-container .vapi-btn {
          opacity: 0 !important;
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
          cursor: pointer !important;
          z-index: 20 !important;
        }

        #vapi-button-container svg {
          pointer-events: none !important;
          user-select: none !important;
        }

        @keyframes speaking {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes listening {
          0%,
          100% {
            transform: scale(0.95);
          }
          50% {
            transform: scale(1);
          }
        }

        @keyframes sparkle {
          0%,
          100% {
            opacity: 0.4;
          }
          50% {
            opacity: 1;
          }
        }

        .animate-speaking .sparkle-1 {
          animation: sparkle 2s infinite ease-in-out;
        }

        .animate-speaking .sparkle-2 {
          animation: sparkle 2s infinite ease-in-out 0.3s;
        }

        .animate-speaking .sparkle-3 {
          animation: sparkle 2s infinite ease-in-out 0.6s;
        }

        .animate-listening .sparkle-1,
        .animate-listening .sparkle-2,
        .animate-listening .sparkle-3 {
          animation: sparkle 1s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Page;
