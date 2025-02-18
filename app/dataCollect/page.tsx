/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState, useRef } from "react";
import { Sparkles } from "lucide-react";
import { CallButtonSvg } from "../ui/call-button";
import { Button } from "@/components/ui/button";
import { LineChart, Database, BookOpen } from "lucide-react";
import SpeakingAnimation from "../ui/speaking-animation";
import MicButton from "../ui/mic-button";
import ListeningIndicator from "../ui/listening-indicator";
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  isHighlighted?: boolean;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  isHighlighted = false,
}) => {
  return (
    <div
      className={`flex items-center h-12 rounded-lg px-6 ${
        isHighlighted ? "bg-blue-100/80" : "bg-blue-50"
      }`}
    >
      <div className="bg-[#FFFFFF66] w-8 h-8 rounded flex items-center justify-center mr-4">
        <div className="text-[#0083BF]">{icon}</div>
      </div>
      <span className="text-[#011A2E] text-sm font-normal">{title}</span>
    </div>
  );
};
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
              if (Array.isArray(data.answered_questions)) {
                setAnalysisQuestions(data.answered_questions);
              } else {
                // Fallback handling if the response is not an array
                console.error("Unexpected response format:", data);
                setAnalysisQuestions([]);
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
          // Only append transcript when role is user
          if (message.role === "user") {
            transcriptRef.current += message.transcript;
            setAiState("listening");
          }
          // setTimeout(() => setAiState("active"), 1000);
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
    // setTimeout(() => {
    //   if (vapiButtonRef.current) {
    //     vapiButtonRef.current.click();
    //   }
    // }, 400);
    window.location.reload();
  };

  const handleResetClick = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#E6F3F9] flex flex-col items-center justify-center p-8">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-semibold text-[#011A2E] ml-4">
          Heller&apos;s Tribal Knowledge
        </h1>
        <div className="flex items-center justify-center gap-3">
          <svg
            width="72"
            height="73"
            viewBox="0 0 42 43"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g filter="url(#filter0_f_77_4866)">
              <path
                d="M29.9003 37.0088C29.8231 33.3665 32.7545 30.3724 36.3975 30.3724H36.5367H36.4665C32.8126 30.3724 29.8614 27.3897 29.9003 23.736L29.8933 23.953C29.7781 27.5313 26.844 30.3724 23.2639 30.3724C26.8186 30.3724 29.7409 33.1756 29.8886 36.7272L29.9003 37.0088Z"
                fill="#0083BF"
              />
            </g>
            <path
              d="M29.9003 37.0088C29.8231 33.3665 32.7545 30.3724 36.3975 30.3724H36.5367H36.4665C32.8126 30.3724 29.8614 27.3897 29.9003 23.736L29.8933 23.953C29.7781 27.5313 26.844 30.3724 23.2639 30.3724C26.8186 30.3724 29.7409 33.1756 29.8886 36.7272L29.9003 37.0088Z"
              fill="#011A2E"
            />
            <g filter="url(#filter1_f_77_4866)">
              <path
                d="M17.7451 30.3724C17.6037 23.7011 22.973 18.2167 29.6459 18.2167H29.9008H29.7722C23.0794 18.2167 17.6739 12.7533 17.7451 6.06093L17.7323 6.45849C17.5212 13.0127 12.147 18.2167 5.58936 18.2167C12.1004 18.2167 17.4531 23.3513 17.7237 29.8568L17.7451 30.3724Z"
                fill="#0B74C8"
              />
            </g>
            <path
              d="M17.7451 30.3724C17.6037 23.7011 22.973 18.2167 29.6459 18.2167H29.9008H29.7722C23.0794 18.2167 17.6739 12.7533 17.7451 6.06093L17.7323 6.45849C17.5212 13.0127 12.147 18.2167 5.58936 18.2167C12.1004 18.2167 17.4531 23.3513 17.7237 29.8568L17.7451 30.3724Z"
              fill="#0083BF"
            />
            <defs>
              <filter
                id="filter0_f_77_4866"
                x="17.7938"
                y="18.2659"
                width="24.2129"
                height="24.213"
                filterUnits="userSpaceOnUse"
                color-interpolation-filters="sRGB"
              >
                <feFlood flood-opacity="0" result="BackgroundImageFix" />
                <feBlend
                  mode="normal"
                  in="SourceGraphic"
                  in2="BackgroundImageFix"
                  result="shape"
                />
                <feGaussianBlur
                  stdDeviation="2.73504"
                  result="effect1_foregroundBlur_77_4866"
                />
              </filter>
              <filter
                id="filter1_f_77_4866"
                x="0.119269"
                y="0.590842"
                width="35.2517"
                height="35.2517"
                filterUnits="userSpaceOnUse"
                color-interpolation-filters="sRGB"
              >
                <feFlood flood-opacity="0" result="BackgroundImageFix" />
                <feBlend
                  mode="normal"
                  in="SourceGraphic"
                  in2="BackgroundImageFix"
                  result="shape"
                />
                <feGaussianBlur
                  stdDeviation="2.73504"
                  result="effect1_foregroundBlur_77_4866"
                />
              </filter>
            </defs>
          </svg>
          <h2 className="text-6xl font-bold text-[#0083BF]">AI Agent</h2>
        </div>
      </div>
      <div className="text-center mb-10 mt-6">
        <p className="text-sm font-medium text-[#004869]">
          A smart voice assistant that captures expert knowledge to preserve
          industry insights and enhance operational efficiency.
        </p>
      </div>

      <div id="vapi-button-container" className="relative mb-4">
        <div className="flex items-center justify-center">
          {aiState === "speaking" ? (
            <SpeakingAnimation />
          ) : aiState === "active" || aiState === "listening" ? (
            <ListeningIndicator />
          ) : (
            <MicButton onClick={handleStartClick} />
          )}
        </div>
      </div>
      <div className="text-center mb-10">
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

      <div className="flex flex-col items-center gap-2">
        {callStatus === "idle" ? (
          <Button
            onClick={handleStartClick}
            className="bg-[#08ACF7] hover:bg-[#006699] text-white text-sm text-center font-semibold px-2.5 py-3 rounded-sm cursor-pointer w-32"
            disabled={isLoading}
          >
            {isLoading ? "Starting..." : "Start Heller Talk"}
          </Button>
        ) : (
          <>
            <Button
              onClick={handleEndClick}
              className="bg-[#08ACF7] hover:bg-[#006699] text-white text-sm text-center font-semibold px-2.5 py-3 rounded-sm cursor-pointer w-32"
              disabled={isLoading}
            >
              {isLoading ? "Ending..." : "End Heller Talk"}
            </Button>
            <span
              onClick={handleResetClick}
              className="text-[#08ACF7] hover:text-[#006699] cursor-pointer text-sm"
            >
              Reset Talk
            </span>
          </>
        )}
      </div>
      {aiState === "idle" && (
        <>
          <div className="text-center mb-4 mt-8">
            <p className="text-lg font-medium text-[#011A2E99]">Key Features</p>
          </div>
          <div className="flex gap-4">
            <FeatureCard
              icon={<BookOpen size={20} />}
              title="Interactive Knowledge Capture"
              isHighlighted={true}
            />
            <FeatureCard
              icon={<LineChart size={20} />}
              title="Dynamic Topic Adaptation"
              isHighlighted={true}
            />
            <FeatureCard
              icon={<Database size={20} />}
              title="Smart Transcript & Data Storage"
              isHighlighted={true}
            />
          </div>
        </>
      )}

      {analysisQuestions.length > 0 && (
        <div className="text-center space-y-4 mt-8">
          <p className="text-xl text-[#004869]">Discussion Topics</p>
          <div className="space-y-3">
            {analysisQuestions.map((question, index) => (
              <div
                key={index}
                className="inline-block px-4 py-2 w-full max-w-2xl"
              >
                <p className="text-[#004869]">{question}</p>
              </div>
            ))}
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
