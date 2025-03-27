/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React from "react";
import { useState, useRef, useEffect } from "react";
import {
  Send,
  Zap,
  ChevronDown,
  FileText,
  AlertTriangle,
  Search,
  Lightbulb,
  Settings,
  Globe,
  RefreshCw,
  Brain,
  TrendingUp,
  Leaf,
  Package,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

// Import the ChatHistoryMessage type from chatbotapi.ts
import {
  queryHellerApi,
  saveChatHistory,
  getChatHistory,
  type ApiResponse,
  type ChatHistoryMessage,
} from "@/lib/chatbotapi";

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
  {
    filename:
      "RFC-398 Reactor Catalyst Remove Tooling (17).pdf",
    link: "https://drive.google.com/file/d/1OxsvEUasqYWHiQPqPGe59hfATr2uXC7O/view?usp=sharing",
  },
];

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Record<string, { page: number; relevance: number }[]>;
}

// Replace the initialSearchResults prop type from 'any' to a proper type
interface ChatInterfaceProps {
  initialSearchQuery?: string;
  initialSearchResults?: ApiResponse | null;
  showChatMode?: boolean;
  onSearch: (query: string) => void;
  onBackToResults?: () => void;
  onBackToLanding?: () => void;
  isLoading?: boolean;
}

// Format answer into sections for both search results and chat
const formatAnswer = (answer: string) => {
  // This is a simple example - you might need more sophisticated parsing
  const sections = answer.split(/\d+\.\s+/).filter(Boolean);

  if (sections.length <= 1) {
    return (
      <div className="prose max-w-none">
        <ReactMarkdown>{answer}</ReactMarkdown>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sections.map((section, index) => {
        const title = section.split("\n")[0].trim();
        const content = section.split("\n").slice(1).join("\n").trim();

        return (
          <div key={index} className="space-y-2">
            <div className="prose max-w-none">
              <ReactMarkdown>{`${
                index + 1
              }. ${title}\n${content}`}</ReactMarkdown>
            </div>
          </div>
        );
      })}
    </div>
  );
};

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

export default function ChatInterface({
  initialSearchQuery = "",
  initialSearchResults = null,
  showChatMode = false,
  onSearch,
  onBackToResults,
  onBackToLanding,
  isLoading: parentIsLoading = false,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(() => {
    // Initialize with search query and results if provided
    if (initialSearchQuery && showChatMode) {
      // Check if we have existing chat history
      const existingHistory = getChatHistory(initialSearchQuery);

      if (existingHistory && existingHistory.length > 0) {
        // Convert the history format to Message format
        return existingHistory.map(
          (msg: ChatHistoryMessage, index: number) => ({
            id: (Date.now() + index).toString(),
            role: msg.role,
            content: msg.content,
            sources: msg.sources,
          })
        );
      } else if (initialSearchResults) {
        // If no history but we have search results, initialize with those
        return [
          {
            id: Date.now().toString(),
            role: "user",
            content: initialSearchQuery,
          },
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: (initialSearchResults as ApiResponse).answer,
            sources: (initialSearchResults as ApiResponse).sources,
          },
        ];
      }
    }
    return [];
  });

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"insights" | "trends" | "search">(
    "search"
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Check if we should show the search tab
    if (!showChatMode && messages.length === 0) {
      const shouldShowSearch = sessionStorage.getItem("showSearchTab");
      if (shouldShowSearch === "true") {
        // Clear the flag
        sessionStorage.removeItem("showSearchTab");
        // Set the active tab to search
        setActiveTab("search");
      }
    }
  }, [showChatMode, messages.length]);

  // Update the handleSubmit function to handle the conversation_id from the API response
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || parentIsLoading) return;

    // If in landing page mode and this is the first message, use the onSearch callback
    if (messages.length === 0 && !showChatMode) {
      onSearch(input);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
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

      const finalMessages = [...updatedMessages, botMessage];
      setMessages(finalMessages);

      // Save chat history if we're in chat mode
      if (showChatMode && initialSearchQuery) {
        // Convert messages to the format expected by saveChatHistory
        const historyMessages = finalMessages.map((msg) => ({
          role: msg.role,
          content: msg.content,
          sources: msg.sources,
        }));
        saveChatHistory(initialSearchQuery, historyMessages);
      }
    } catch (error) {
      console.error("Error fetching response:", error);

      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Please try again, server is busy.",
      };

      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);

      // Save chat history even with error
      if (showChatMode && initialSearchQuery) {
        const historyMessages = finalMessages.map((msg) => ({
          role: msg.role,
          content: msg.content,
          sources: msg.sources,
        }));
        saveChatHistory(initialSearchQuery, historyMessages);
      }
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

  const handleQuestionClick = (question: string) => {
    setInput(question);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Handle explore more button clicks
  const handleExploreMore = (question: string) => {
    // If we're already in chat mode, just add the question
    if (showChatMode) {
      setInput(question);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    } else {
      // Otherwise, trigger a search with this question
      onSearch(question);
    }
  };

  // Modify the return statement to conditionally show the input area
  return (
    <ErrorBoundary>
      <div
        className="h-[calc(100vh-4rem)] relative w-full flex flex-col bg-white"
        data-active-tab={activeTab}
      >
        {showChatMode && onBackToResults && (
          <div className="border-b border-gray-200 p-4">
            <button
              className="flex items-center text-[#0083BF]"
              onClick={onBackToResults}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Results
            </button>
          </div>
        )}
        {/* Main chat container */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 md:p-6 mt-2 h-full"
        >
          {messages.length === 0 && !showChatMode ? (
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="text-center w-full mx-auto p-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#00AFFF] shadow-sm mt-24">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-[#00AFFF] mt-6">
                  Heller Technical Assistant
                </h3>
                <p className="text-black text-sm mt-4">
                  Ask me anything about Heller flux reactors, maintenance
                  procedures, or technical specifications.
                </p>

                {/* Category buttons */}
                <div className="hidden flex gap-4 justify-center mt-16 w-full">
                  <button
                    className={`text-center px-4 py-3 rounded-md text-[#011A2E] transition-colors w-fit ${
                      activeTab === "insights"
                        ? "bg-[#E6F7FF] border-[#B0E6FF] border"
                        : "bg-[#F5FBFF] hover:bg-[#E6F7FF]"
                    }`}
                    onClick={() => setActiveTab("insights")}
                  >
                    Heller Insights
                  </button>
                  <button
                    className={`text-center px-4 py-3 rounded-md text-[#011A2E] transition-colors w-fit ${
                      activeTab === "trends"
                        ? "bg-[#E6F7FF] border-[#B0E6FF] border"
                        : "bg-[#F5FBFF] hover:bg-[#E6F7FF]"
                    }`}
                    onClick={() => setActiveTab("trends")}
                  >
                    Explore Trends
                  </button>
                  <button
                    className={`text-center px-4 py-3 rounded-md text-[#011A2E] transition-colors w-fit ${
                      activeTab === "search"
                        ? "bg-[#E6F7FF] border-[#B0E6FF] border"
                        : "bg-[#F5FBFF] hover:bg-[#E6F7FF]"
                    }`}
                    onClick={() => setActiveTab("search")}
                  >
                    Search & Discover
                  </button>
                </div>

                {/* Content based on active tab */}
                {activeTab === "insights" && (
                  <div className="mt-8">
                    <h2 className="text-base text-[#545454] font-medium mb-6 mt-20">
                      Discover Heller Insights to Power Your Decisions
                    </h2>
                    <div className="flex flex-wrap gap-6">
                      {/* Card 1 */}
                      <div className="border border-gray-200 rounded-lg p-5 flex flex-col items-center text-center flex-1 min-w-[250px]">
                        <div className="w-12 h-12 rounded-full bg-[#E6F7FF] flex items-center justify-center mb-4">
                          <Lightbulb className="w-6 h-6 text-[#00AFFF]" />
                        </div>
                        <h3 className="text-base font-medium text-[#011A2E] mb-2">
                          Industry Innovations
                        </h3>
                        <p className="text-[#011A2E99] text-sm mb-4">
                          Heller&apos;s Mark 7 Series achieves a 40% reduction
                          in nitrogen consumption.
                        </p>
                      </div>

                      {/* Card 2 */}
                      <div className="border border-gray-200 rounded-lg p-5 flex flex-col items-center text-center flex-1 min-w-[250px]">
                        <div className="w-12 h-12 rounded-full bg-[#E6F7FF] flex items-center justify-center mb-4">
                          <Settings className="w-6 h-6 text-[#00AFFF]" />
                        </div>
                        <h3 className="text-base font-medium text-[#011A2E] mb-2">
                          Smart Manufacturing
                        </h3>
                        <p className="text-[#011A2E99] text-sm mb-4">
                          Industry 4.0 integration enables real-time process
                          monitoring.
                        </p>
                      </div>

                      {/* Card 3 */}
                      <div className="border border-gray-200 rounded-lg p-5 flex flex-col items-center text-center flex-1 min-w-[250px]">
                        <div className="w-12 h-12 rounded-full bg-[#E6F7FF] flex items-center justify-center mb-4">
                          <RefreshCw className="w-6 h-6 text-[#00AFFF]" />
                        </div>
                        <h3 className="text-base font-medium text-[#011A2E] mb-2">
                          Sustainability in Production
                        </h3>
                        <p className="text-[#011A2E99] text-sm mb-4">
                          Energy-efficient reflow ovens reduce carbon footprint.
                        </p>
                      </div>

                      {/* Card 4 */}
                      <div className="border border-gray-200 rounded-lg p-5 flex flex-col items-center text-center flex-1 min-w-[250px]">
                        <div className="w-12 h-12 rounded-full bg-[#E6F7FF] flex items-center justify-center mb-4">
                          <Globe className="w-6 h-6 text-[#00AFFF]" />
                        </div>
                        <h3 className="text-base font-medium text-[#011A2E] mb-2">
                          Global Expansion Strategies
                        </h3>
                        <p className="text-[#011A2E99] text-sm mb-4">
                          Manufacturing shift from China to Korea to optimize
                          tariffs.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "trends" && (
                  <div className="mt-8">
                    <h2 className="text-base text-[#545454] font-medium mb-6 mt-20">
                      Stay Ahead with Emerging Trends in Manufacturing &
                      Technology
                    </h2>
                    <div className="flex flex-wrap gap-6">
                      {/* Card 1 */}
                      <div className="border border-gray-200 rounded-lg p-5 flex flex-col items-center text-center flex-1 min-w-[250px]">
                        <div className="w-12 h-12 rounded-full bg-[#E6F7FF] flex items-center justify-center mb-4">
                          <Brain className="w-6 h-6 text-[#00AFFF]" />
                        </div>
                        <h3 className="text-base font-medium text-[#011A2E] mb-2">
                          AI-Driven Optimization
                        </h3>
                        <p className="text-[#011A2E99] text-sm mb-4">
                          Discover how artificial intelligence is
                          revolutionizing manufacturing efficiency.
                        </p>
                        <button
                          className="hidden text-[#0083BF] font-semibold text-sm flex items-center mt-2"
                          onClick={() =>
                            handleExploreMore(
                              "Tell me about AI-Driven Optimization in manufacturing"
                            )
                          }
                        >
                          Explore More
                          <ChevronDown className="w-4 h-4 ml-1 rotate-[-90deg]" />
                        </button>
                      </div>

                      {/* Card 2 */}
                      <div className="border border-gray-200 rounded-lg p-5 flex flex-col items-center text-center flex-1 min-w-[250px]">
                        <div className="w-12 h-12 rounded-full bg-[#E6F7FF] flex items-center justify-center mb-4">
                          <TrendingUp className="w-6 h-6 text-[#00AFFF]" />
                        </div>
                        <h3 className="text-base font-medium text-[#011A2E] mb-2">
                          The Rise of Industry 4.0
                        </h3>
                        <p className="text-[#011A2E99] text-sm mb-4">
                          Explore the shift toward smart factories and connected
                          production lines.
                        </p>
                        <button
                          className="hidden text-[#0083BF] font-semibold text-sm flex items-center mt-2"
                          onClick={() =>
                            handleExploreMore(
                              "Explain Industry 4.0 and smart manufacturing"
                            )
                          }
                        >
                          Explore More
                          <ChevronDown className="w-4 h-4 ml-1 rotate-[-90deg]" />
                        </button>
                      </div>

                      {/* Card 3 */}
                      <div className="border border-gray-200 rounded-lg p-5 flex flex-col items-center text-center flex-1 min-w-[250px]">
                        <div className="w-12 h-12 rounded-full bg-[#E6F7FF] flex items-center justify-center mb-4">
                          <Leaf className="w-6 h-6 text-[#00AFFF]" />
                        </div>
                        <h3 className="text-base font-medium text-[#011A2E] mb-2">
                          Sustainability & Green Manufacture
                        </h3>
                        <p className="text-[#011A2E99] text-sm mb-4">
                          Understand the latest sustainability initiatives
                          shaping the industry.
                        </p>
                        <button
                          className="hidden text-[#0083BF] font-semibold text-sm flex items-center mt-2"
                          onClick={() =>
                            handleExploreMore(
                              "What are the sustainability initiatives in manufacturing?"
                            )
                          }
                        >
                          Explore More
                          <ChevronDown className="w-4 h-4 ml-1 rotate-[-90deg]" />
                        </button>
                      </div>

                      {/* Card 4 */}
                      <div className="border border-gray-200 rounded-lg p-5 flex flex-col items-center text-center flex-1 min-w-[250px]">
                        <div className="w-12 h-12 rounded-full bg-[#E6F7FF] flex items-center justify-center mb-4">
                          <Package className="w-6 h-6 text-[#00AFFF]" />
                        </div>
                        <h3 className="text-base font-medium text-[#011A2E] mb-2">
                          Global Supply Chain Adaptations
                        </h3>
                        <p className="text-[#011A2E99] text-sm mb-4">
                          Learn how manufacturers are adapting to global
                          economic shifts.
                        </p>
                        <button
                          className="hidden text-[#0083BF] font-semibold text-sm flex items-center mt-2"
                          onClick={() =>
                            handleExploreMore(
                              "How are global supply chains changing in manufacturing?"
                            )
                          }
                        >
                          Explore More
                          <ChevronDown className="w-4 h-4 ml-1 rotate-[-90deg]" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "search" && (
                  <div className="mt-8">
                    {/* Search bar */}
                    <div className="flex gap-3 items-center mt-12">
                      <div className="relative flex-grow ml-6">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none ">
                          <Search className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00AFFF] focus:border-transparent"
                          placeholder="Ask anything about Heller products and technical specifications..."
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleSubmit(e);
                            }
                          }}
                        />
                      </div>
                      <Button
                        className="bg-[#009FE8] hover:bg-[#0083BF] font-semibold text-sm text-white px-6 py-6 rounded-md"
                        onClick={(e) => handleSubmit(e)}
                      >
                        Search
                      </Button>
                    </div>

                    <h2 className="text-base text-[#545454] font-medium mt-16">
                      Discover & Get Instant Answers to Key Questions
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
                      {[
                        "How can I improve efficiency in reflow soldering?",
                        "What are the steps for Reactor Catalyst Removal Retrofit?",
                        "What is the purpose of the wire mesh trap in the flux reactor?",
                        "How to loosen the reactor flange?",
                        "What all materials do you need for a reactor upgrade?",
                        "Describe the differences between fresh and aged Zeolite under the electron microscope",
                        "What does an Aged Cu-LPA Wire Mesh Catalyst Traps look like?",
                        "What is the purpose of the Getter Screen in the reactor system?"
                      ].map((question) => (
                        <button
                          key={question}
                          className="text-left p-5 border border-gray-200 rounded-lg hover:border-[#00AFFF] hover:bg-[#E6F7FF] transition-colors flex-1 min-w-[250px]"
                          onClick={() => handleQuestionClick(question)}
                        >
                          <p className="text-[#011A2E] text-xs text-center">
                            {question}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
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
                          {message.role === "assistant" ? (
                            formatAnswer(message.content)
                          ) : (
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          )}
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
                    <div className="mt-4 ml-13">
                      <h3 className="text-lg mb-4 ml-10">Sources</h3>
                      <div className="flex flex-wrap gap-4 ml-10">
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
                              <a
                                key={index}
                                href={linkInfo?.link || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-[#0083BF] hover:text-[#006a9e] transition-colors group bg-[#F5FBFF] hover:bg-[#E6F7FF] px-4 py-2 rounded-md"
                              >
                                <FileText className="h-5 w-5 flex-shrink-0" />
                                <span>View {filename}</span>
                              </a>
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

        {/* Input area - only show when messages exist or in chat mode */}
        {(messages.length > 0 || showChatMode) && (
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
        )}
      </div>
    </ErrorBoundary>
  );
}
