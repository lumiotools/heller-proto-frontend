/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Send, ChevronLeft, FileText, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import {
  queryHellerApi,
  saveChatHistory,
  getSearchResults,
  type ApiResponse,
  type ChatHistoryMessage,
} from "@/lib/chatbotapi";

// Update the interface to use proper types
interface SearchResultsProps {
  query: string;
  results: ApiResponse | null;
  onWantMoreInfo: (wantMore: boolean) => void;
  onBackToLanding: () => void;
  isLoading?: boolean;
  searchHistory: string[];
  onSearch: (query: string) => void;
  onUpdateChatHistory?: (query: string, messages: ChatHistoryMessage[]) => void;
}

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

// Change the formatAnswer function to not force bold styling and let markdown render naturally
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

// Component to display sources consistently
const SourcesDisplay = ({
  sources,
  messageId = null,
}: {
  sources: Record<string, { page: number; relevance: number }[]>;
  messageId?: string | null;
}) => {
  if (!sources || Object.keys(sources).length === 0) return null;

  return (
    <div className="mt-4">
      <h3 className="text-lg mb-4">Sources</h3>
      <div className="flex flex-wrap gap-4">
        {Object.entries(sources).map(([filename, pages], index) => {
          // Find the link for this filename
          const linkInfo = linksArray.find(
            (item) =>
              item.filename.toLowerCase().includes(filename.toLowerCase()) ||
              filename.toLowerCase().includes(item.filename.toLowerCase())
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
        })}
      </div>
    </div>
  );
};

// Then in the component destructuring, add the new prop
export default function SearchResults({
  query,
  results,
  onWantMoreInfo,
  onBackToLanding,
  isLoading = false,
  searchHistory = [],
  onSearch,
  onUpdateChatHistory,
}: SearchResultsProps) {
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatHistoryMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Reset chat messages when query changes
  useEffect(() => {
    // Clear chat messages when query changes
    setChatMessages([]);
    setShowChat(false);

    // Check if we have existing chat history for this query
    if (query) {
      const savedData = getSearchResults(query);
      if (
        savedData &&
        savedData.chatHistory &&
        savedData.chatHistory.length > 0
      ) {
        // If there's chat history, automatically show the chat view
        setShowChat(true);
        setChatMessages(savedData.chatHistory);
        console.log("Loaded existing chat history for:", query);
      }
    }
  }, [query]);

  // Add only the initial question when "Yes" is clicked, not the answer
  useEffect(() => {
    if (showChat && query && chatMessages.length === 0) {
      // Initialize new chat with just the user query
      setChatMessages([{ role: "user" as const, content: query }]);

      // Immediately trigger a chat response
      handleInitialChatResponse();
    }
  }, [showChat, query, chatMessages.length]);

  // Handle the initial chat response
  const handleInitialChatResponse = async () => {
    if (!query || isChatLoading || !results) return;

    setIsChatLoading(true);

    try {
      // We already have the results, so we can use them directly
      const newBotMessage: ChatHistoryMessage = {
        role: "assistant",
        content: results.answer,
        sources: results.sources,
      };

      const updatedMessages = [...chatMessages, newBotMessage];
      setChatMessages(updatedMessages);

      // Save chat history
      saveChatHistory(query, updatedMessages);

      // Update parent state if the callback exists
      if (onUpdateChatHistory) {
        onUpdateChatHistory(query, updatedMessages);
      }
    } catch (error) {
      console.error("Error setting initial chat response:", error);

      const updatedMessages = [
        ...chatMessages,
        {
          role: "assistant" as const,
          content: "Please try again, server is busy.",
        },
      ];
      setChatMessages(updatedMessages);

      // Save chat history even with error message
      saveChatHistory(query, updatedMessages);

      // Update parent state if the callback exists
      if (onUpdateChatHistory) {
        onUpdateChatHistory(query, updatedMessages);
      }
    } finally {
      setIsChatLoading(false);
    }
  };

  // Scroll to bottom of chat when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Handle chat submission
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const newUserMessage: ChatHistoryMessage = {
      role: "user",
      content: chatInput,
    };
    const messagesWithUserInput = [...chatMessages, newUserMessage];
    setChatMessages(messagesWithUserInput);
    setChatInput("");
    setIsChatLoading(true);

    try {
      // Pass the conversation ID from the original search results if available
      const conversationId = results?.conversation_id || null;
      const data = await queryHellerApi(chatInput, conversationId);

      const newBotMessage: ChatHistoryMessage = {
        role: "assistant",
        content: data.answer,
        sources: data.sources,
      };

      const updatedMessages = [...messagesWithUserInput, newBotMessage];
      setChatMessages(updatedMessages);

      // Save updated chat history both to localStorage and to parent state
      saveChatHistory(query, updatedMessages);

      // This is a prop we need to add to update the parent state
      if (onUpdateChatHistory) {
        onUpdateChatHistory(query, updatedMessages);
      }
    } catch (error) {
      console.error("Error fetching chat response:", error);

      const updatedMessages = [
        ...messagesWithUserInput,
        {
          role: "assistant" as const,
          content: "Please try again, server is busy.",
        },
      ];
      setChatMessages(updatedMessages);

      // Save chat history even with error message
      saveChatHistory(query, updatedMessages);

      // Update parent state
      if (onUpdateChatHistory) {
        onUpdateChatHistory(query, updatedMessages);
      }
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-white mt-8 ml-5">
      {/* History Sidebar */}
      <div className="w-64  p-4 hidden md:block">
        <h2 className="text-lg font-semibold mb-4">History</h2>
        <div className="space-y-2">
          {searchHistory.length > 0 ? (
            searchHistory.map((item, index) => {
              // Check if this history item has chat history
              const savedData = getSearchResults(item);
              const hasChatHistory =
                savedData?.chatHistory && savedData.chatHistory.length > 0;

              return (
                <div
                  key={index}
                  className={`p-2 hover:bg-gray-100 rounded cursor-pointer text-sm ${
                    hasChatHistory ? "border-l-2 border-[#0083BF]" : ""
                  } ${item === query ? "bg-gray-100 font-medium" : ""}`}
                  onClick={() => onSearch(item)}
                >
                  {item}
                </div>
              );
            })
          ) : (
            <div className="text-sm text-gray-500 italic">
              No search history yet
            </div>
          )}
        </div>
        {/* <div className="mt-4">
          <Button
            variant="outline"
            className="w-full text-sm"
            onClick={onBackToLanding}
          >
            + Make New Search
          </Button>
        </div> */}
        <div
          className="flex items-center text-[#0083BF] cursor-pointer"
          onClick={() => {
            if (searchInputRef.current) {
              searchInputRef.current.value = "";
              searchInputRef.current.focus();
            }
          }}
        >
          <div className="h-6 mr-2 mt-4"></div>
          <div className="flex items-center gap-1">
            <span className="text-lg">+</span>
            <span className="text-base font-medium">Make New Search</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto flex flex-col mb-16">
        {/* Back button and breadcrumb */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex items-center space-x-1 text-sm">
              <Button
                variant="ghost"
                size="lg"
                className="h-8"
                onClick={onBackToLanding}
              >
                <ChevronLeft className="h-4 w-4  text-[#0083BF]" />
                Back
              </Button>
              <span className="text-gray-500">/</span>
              <span className="text-[#0083BF]">{query}</span>
            </div>
            <div className="flex-1 max-w-2xl">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const searchInput = e.currentTarget.querySelector("input");
                  if (searchInput && searchInput.value) {
                    onSearch(searchInput.value);
                  }
                }}
              >
                <div className="relative flex items-center gap-2">
                  <div className="relative flex items-center w-full">
                    <Search className="absolute left-3 h-5 w-5 text-gray-400" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00AFFF] focus:border-transparent"
                      placeholder="Ask anything about Heller Industries..."
                      defaultValue=""
                      onClick={(e) => (e.currentTarget.value = "")}
                    />
                  </div>
                  <div>
                    <Button
                      type="submit"
                      className="bg-[#009FE8] hover:bg-[#0083BF] font-semibold text-sm text-white px-6 py-5 rounded-md"
                    >
                      Search
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Content Area - Either Search Results or Chat */}
        <div className="flex-1 overflow-auto">
          {!showChat ? (
            // Search Results View
            <div className="max-w-4xl mx-auto p-6">
              <h1 className="text-xl font-medium mb-6">
                Your Search Results for:{" "}
                <span className="text-[#0083BF]">{query}</span>
              </h1>

              {isLoading ? (
                <div className="flex justify-center items-center p-12">
                  <div className="flex space-x-2">
                    <div
                      className="w-3 h-3 bg-[#08ACF7] rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-3 h-3 bg-[#08ACF7] rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-3 h-3 bg-[#08ACF7] rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              ) : results ? (
                <div className="bg-white rounded-lg p-6">
                  <div className="prose max-w-none">
                    {formatAnswer(results.answer)}
                  </div>

                  {/* Sources */}
                  {results.sources &&
                    Object.keys(results.sources).length > 0 && (
                      <SourcesDisplay sources={results.sources} />
                    )}

                  {/* Want More Information */}
                  <div className="mt-10 border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium mb-4 text-center">
                      Want More Information?
                    </h3>
                    <div className="flex justify-center space-x-4">
                      <Button
                        className="bg-[#0083BF] hover:bg-[#006a9e] text-white px-8"
                        onClick={() => setShowChat(true)}
                      >
                        Yes
                      </Button>
                      <Button
                        variant="outline"
                        className="border-[#0083BF] text-[#0083BF] hover:bg-[#e6f7ff] px-8"
                        onClick={() => onWantMoreInfo(false)}
                      >
                        No
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center items-center p-12">
                  <div className="text-center text-gray-500">
                    <p>Loading search results...</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Chat View
            <div className="max-w-4xl mx-auto p-6">
              <h1 className="text-xl font-medium mb-6">
                Chat about: <span className="text-[#0083BF]">{query}</span>
              </h1>

              <div className="bg-white rounded-lg p-6">
                <div className="space-y-6">
                  {chatMessages.map((message, index) => (
                    <div
                      key={index}
                      className={cn(
                        "transform transition-all duration-300",
                        index === chatMessages.length - 1 &&
                          "animate-message-appear"
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
                            <span className="text-[#005d88] font-medium">
                              U
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Sources component */}
                      {message.role === "assistant" && message.sources && (
                        <div className="ml-13 mt-2">
                          <SourcesDisplay
                            sources={message.sources}
                            messageId={`message-${index}`}
                          />
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Loading indicator */}
                  {isChatLoading && (
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

                  <div ref={messagesEndRef} />
                </div>

                {/* Chat input */}
                <form onSubmit={handleChatSubmit} className="mt-6">
                  <div className="relative">
                    <Textarea
                      ref={chatInputRef}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleChatSubmit(e);
                        }
                      }}
                      placeholder="Ask follow-up questions..."
                      className="pr-12 min-h-[60px] max-h-[150px] resize-none border-blue-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                      disabled={isChatLoading}
                    />
                    <Button
                      type="submit"
                      size="icon"
                      className={cn(
                        "absolute right-3 bottom-3 h-9 w-9 rounded-md bg-[#08ACF7] hover:bg-blue-700 transition-colors",
                        isChatLoading && "opacity-50 cursor-not-allowed"
                      )}
                      disabled={isChatLoading}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
