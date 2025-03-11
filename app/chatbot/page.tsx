"use client";

import React from "react";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Zap,
  ChevronDown,
  ExternalLink,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { queryHellerApi } from "@/lib/chatbotapi";

// Links array from your data
const linksArray = [
  {
    filename: "2043MK7 System User Manual - Flux Reactor Maintenance.pdf",
    link: "https://drive.google.com/file/d/1mMNbQBWnw-ejenPIXYpwPI0hMVWvPC6n/view?usp=sharing",
  },
  {
    filename: "848861 REACTOR UPGRADE TEST Retrofit (R2).xlsx",
    link: "https://docs.google.com/spreadsheets/d/1I4rKI4aEW6XXjQ6PuX2JY-1tOJBSSe8W/edit?usp=sharing&ouid=111377379083910385195&rtpof=true&sd=true",
  },
  {
    filename: "854508 Reactor Catalyst Remove Retrofit (R1).xls",
    link: "https://docs.google.com/spreadsheets/d/1raFr_s729zOelX32wUEyoRogoFW7iLzy/edit?usp=sharing&ouid=111377379083910385195&rtpof=true&sd=true",
  },
  {
    filename: "4177290 (rev. A).pdf",
    link: "https://drive.google.com/file/d/1Njp7QsRF3AwoEu9DbQTO22UIizWVJ_gF/view?usp=sharing",
  },
  {
    filename: "4188290 (rev. A).pdf",
    link: "https://drive.google.com/file/d/1iLM2FgaNWjrF4pEBb3zRx542VjjZtrtO/view?usp=sharing",
  },
  {
    filename:
      "4196387-Instructions  for Reactor Upgrade Retrofit (A)_RFC-355.pdf",
    link: "https://drive.google.com/file/d/1HaCNL5PmP6ONPtNL0jcYr7rHVm6o3X2B/view?usp=sharing",
  },
  {
    filename:
      "4224364-Instruction  For Reactor Catalyst Remove Retrofit(A).pdf",
    link: "https://drive.google.com/file/d/156qAD4F-I8HzQ1uVSHDpbDKG0VuWdlJd/view?usp=sharing",
  },
  {
    filename: "ALPHA zeolite and catalyst (7-26-22) abridged.pdf",
    link: "https://drive.google.com/file/d/1WOlwn2_2vwFbvGIxIg3ow6AbX2dTOaPt/view?usp=sharing",
  },
  {
    filename: "Heller Flux Reactor Overview (4-11-23).pdf",
    link: "https://drive.google.com/file/d/1c_uoS2NBQ5C87samRf5yE0pIz1WGGiXz/view?usp=sharing",
  },
  {
    filename:
      "Reactor Return Gas into Big Flux box Test with Heat Exchanger Water OFF (RFC355).pdf",
    link: "https://drive.google.com/file/d/1aIQC2PZejl6RDHF9ewY1ymgVj_-sL5Ye/view?usp=sharing",
  },
  {
    filename:
      "RFC-355  Reactor Catalyst Upgrade And Return Gas Into Flux Box.pdf",
    link: "https://drive.google.com/file/d/1PxlqRdSr4fqqlTKkxiIaophIfkIRDSld/view?usp=sharing",
  },
];

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Record<string, { page: number; relevance: number }[]>;
}

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 rounded-lg bg-red-50 border border-red-200 text-red-800">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h2 className="text-lg font-semibold">Something went wrong</h2>
          </div>
          <p>Please try again, server is busy.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const data = await queryHellerApi(input);

      const botMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.answer,
        sources: data.sources,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error fetching response:", error);

      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Please try again, server is busy.",
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        150
      )}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  return (
    <ErrorBoundary>
      <div className="h-[calc(100vh-4rem)] relative w-full flex flex-col bg-[#E6F3F9]">
        {/* Main chat container */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 md:p-6 mt-2"
        >
          {messages.length === 0 ? (
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="text-center space-y-6 max-w-md mx-auto p-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#00AFFF] shadow-sm">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[#0083BF]">
                  Heller Technical Assistant
                </h3>
                <p className="text-[#011A2E66]">
                  Ask me anything about Heller flux reactors, maintenance
                  procedures, or technical specifications.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
                  {[
                    "How do I maintain a flux reactor?",
                    "What are the safety procedures?",
                    "Tell me about catalyst removal",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      className="text-left px-4 py-2 bg-[#0083BF1A] hover:bg-blue-200 rounded-md text-[#011A2E]transition-colors"
                      onClick={() => {
                        setInput(suggestion);
                        textareaRef.current?.focus();
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 max-w-4xl mx-auto">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={cn(
                    "transform transition-all duration-300",
                    index === messages.length - 1 && "animate-message-appear"
                  )}
                >
                  {/* Message component */}
                  <div
                    className={cn(
                      "flex items-start gap-3 max-w-full",
                      message.role === "user" ? "justify-end" : ""
                    )}
                  >
                    {message.role === "assistant" && (
                      <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-[#0083bf]">
                        <span className="text-white font-medium">H</span>
                      </div>
                    )}

                    <div
                      className={cn(
                        "max-w-[80%]",
                        message.role === "user" ? "order-1" : "order-2"
                      )}
                    >
                      <div
                        className={cn(
                          "p-3 rounded-lg",
                          message.role === "user"
                            ? "bg-[#0083BF1A] text-[#005d88] rounded-tr-none"
                            : "bg-white border border-blue-100 text-black rounded-tl-none"
                        )}
                      >
                        <div className="prose max-w-none break-words">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      </div>
                    </div>

                    {message.role === "user" && (
                      <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-[#0083BF1A] order-2">
                        <span className="text-[#005d88] font-medium">U</span>
                      </div>
                    )}
                  </div>

                  {/* Sources component */}
                  {message.role === "assistant" && message.sources && (
                    <div className="mt-2 ml-13">
                      <div className="flex items-center gap-2 text-sm text-blue-700 mb-1 ml-10">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-[#004869] hover:bg-blue-100 transition-colors"
                          onClick={() => {
                            const sourcesEl = document.getElementById(
                              `sources-${message.id}`
                            );
                            if (sourcesEl) {
                              sourcesEl.classList.toggle("hidden");
                            }
                          }}
                        >
                          <FileText className="h-3.5 w-3.5 mr-1.5" />
                          <span className="mr-1">Sources</span>
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </div>

                      <div
                        id={`sources-${message.id}`}
                        className="hidden pl-2 border-l-2 border-blue-300 space-y-2 ml-10"
                      >
                        {Object.entries(message.sources).map(
                          ([filename, pages], index) => {
                            // Find the link for this filename
                            const linkInfo = linksArray.find(
                              (item) =>
                                item.filename
                                  .toLowerCase()
                                  .includes(filename.toLowerCase()) ||
                                filename
                                  .toLowerCase()
                                  .includes(item.filename.toLowerCase())
                            );

                            // Sort pages by relevance
                            const sortedPages = [...pages].sort(
                              (a, b) => b.relevance - a.relevance
                            );

                            return (
                              <div key={index} className="text-sm">
                                <a
                                  href={linkInfo?.link || "#"}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-start gap-1 hover:text-blue-800 text-[#0077ae] group transition-colors"
                                >
                                  <ExternalLink className="h-3 w-3 mt-1 flex-shrink-0 opacity-70 group-hover:opacity-100" />
                                  <div>
                                    <span className="font-medium">
                                      {filename}
                                    </span>
                                    <span className="text-[#0083bf] ml-1">
                                      (Page{sortedPages.length > 1 ? "s" : ""}{" "}
                                      {sortedPages
                                        .map((p) => Math.round(p.page))
                                        .join(", ")}
                                      )
                                    </span>
                                  </div>
                                </a>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex items-start gap-3 animate-message-appear">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-[#0083bf]">
                    <span className="text-white font-medium">H</span>
                  </div>
                  <div className="p-3 ">
                    <div className="flex space-x-2">
                      <div
                        className="w-2 h-2 bg-[#08ACF7] rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-[#08ACF7] rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-[#08ACF7] rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="p-4 md:p-6">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about flux reactors, maintenance procedures, or technical specifications..."
                className="pr-12 min-h-[60px] max-h-[150px] resize-none border-blue-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                className={cn(
                  "absolute right-3 bottom-3 h-9 w-9 rounded-md bg-[#08ACF7] hover:bg-blue-700 transition-colors",
                  isLoading && "opacity-50 cursor-not-allowed"
                )}
                disabled={isLoading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </ErrorBoundary>
  );
}
