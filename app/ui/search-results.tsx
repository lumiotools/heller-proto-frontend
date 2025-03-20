"use client";
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Send, ChevronLeft, Download, Mail, UserPlus } from "lucide-react";
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
import remarkGfm from "remark-gfm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import dynamic from "next/dynamic";
import { sendColleagueEmail, sendResultsEmail } from "@/lib/sendEmail";
import { SourcesDisplay } from "./source-display";

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

// Improved formatAnswer function with proper markdown styling
const formatAnswer = (answer: string) => {
  return (
    <div className="markdown prose max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{answer}</ReactMarkdown>
    </div>
  );
};

// Email validation function
const isValidEmail = (email: string) => {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

// Function to generate PDF
const generatePDF = async (contentId: string, filename: string) => {
  const contentElement = document.getElementById(contentId);
  if (!contentElement) return;

  try {
    const html2pdfModule = await import("html2pdf.js");
    const html2pdf = html2pdfModule.default;

    const pdfOptions = {
      margin: 10,
      filename: filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    html2pdf().from(contentElement).set(pdfOptions).save();
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
};

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
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailStatus, setEmailStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [isAskColleagueOpen, setIsAskColleagueOpen] = useState(false);
  const [colleagueEmails, setColleagueEmails] = useState("");
  const [askColleagueStatus, setAskColleagueStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [emailMessage, setEmailMessage] = useState("");

  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultContentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isAskColleagueOpen) {
      setEmailMessage(query);
    }
  }, [isAskColleagueOpen]);
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
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
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

  // Handle email sending
  const handleSendEmail = async () => {
    if (!emailInput.trim() || !isValidEmail(emailInput)) {
      alert("Please enter a valid email address");
      return;
    }

    setEmailStatus("sending");

    try {
      await sendResultsEmail(
        emailInput,
        query ?? "", // Ensure query is never null
        results?.answer ?? "", // Default to empty string if null
        results?.sources ?? {} // Default to empty object if null
      );

      console.log("✅ Email sent to", emailInput);
      setEmailStatus("success");

      // Reset state after success
      setTimeout(() => {
        setIsEmailDialogOpen(false);
        setEmailInput("");
        setEmailStatus("idle");
      }, 1500);
    } catch (error) {
      console.error("❌ Error sending email:", error);
      setEmailStatus("error");

      // Reset state after failure
      setTimeout(() => {
        setEmailStatus("idle");
      }, 1500);
    }
  };

  // Handle asking a colleague
  const handleAskColleague = async () => {
    const emails = colleagueEmails.split(",").map((e) => e.trim());
    const allValid = emails.every((email) => isValidEmail(email));

    if (!colleagueEmails.trim() || !allValid) {
      alert("Please enter valid email addresses (comma separated)");
      return;
    }

    setAskColleagueStatus("sending");

    try {
      // Use emailMessage instead of query
      await sendColleagueEmail(colleagueEmails, emailMessage, isValidEmail);
      console.log("✅ Colleague request sent:", colleagueEmails);
      setAskColleagueStatus("success");

      // Reset after success
      setTimeout(() => {
        setIsAskColleagueOpen(false);
        setColleagueEmails("");
        setEmailMessage(""); // Reset the email message
        setAskColleagueStatus("idle");
      }, 1500);
    } catch (error) {
      console.error("❌ Error sending colleague request:", error);
      setAskColleagueStatus("error");

      // Reset after error
      setTimeout(() => {
        setAskColleagueStatus("idle");
      }, 1500);
    }
  };

  // Download results as PDF
  const handleDownloadPDF = () => {
    generatePDF(
      "result-content",
      `Heller-Search-${query.replace(/\s+/g, "-")}.pdf`
    );
  };

  return (
    <div className="flex h-[calc(100vh-80px)] bg-white mt-8 ml-5 pt-6">
      {/* History Sidebar - Fixed height with overflow-y-auto */}
      {/* History Sidebar - Fixed to make history properly scrollable */}
      {/* History Sidebar - Properly fixed for scrolling */}
      <div className="w-64 hidden md:flex flex-col h-[calc(100vh-120px)] ">
        {/* Fixed header */}
        <div className="p-4 pb-2 bg-white ">
          <h2 className="text-lg font-semibold">History</h2>
        </div>

        {/* Scrollable history section */}
        <div className="flex-1 overflow-y-auto">
          {searchHistory.length > 0 ? (
            <div className="px-4 py-2">
              {searchHistory.map((item, index) => {
                // Check if this history item has chat history
                const savedData = getSearchResults(item);
                const hasChatHistory =
                  savedData?.chatHistory && savedData.chatHistory.length > 0;

                return (
                  <div
                    key={index}
                    className={`p-2 hover:bg-gray-100 rounded cursor-pointer text-sm mb-2 ${
                      item === query ? "bg-gray-100 font-medium" : ""
                    }`}
                    onClick={() => onSearch(item)}
                  >
                    {item}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="px-4 py-2">
              <div className="text-sm text-gray-500 italic p-2">
                No message history yet
              </div>
            </div>
          )}
        </div>

        {/* Fixed footer */}
        <div className="p-4 bg-white mt-auto">
          <div
            className="flex items-center text-[#0083BF] cursor-pointer"
            onClick={onBackToLanding}
          >
            <span className="text-lg mr-1">+</span>
            <span className="text-base font-medium">Ask new question</span>
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
              ></form>
            </div>
          </div>
        </div>

        {/* Content Area - Either Search Results or Chat */}
        <div
          className="flex-1 overflow-auto"
          style={{ height: "calc(100vh - 220px)" }}
        >
          {!showChat ? (
            // Search Results View
            <div className="max-w-4xl mx-auto p-6">
              <h1 className="text-xl font-medium">
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
                  <div className="flex justify-end space-x-2 mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 text-[#0083BF] border-[#0083BF]"
                      onClick={() => setIsEmailDialogOpen(true)}
                    >
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 text-[#0083BF] border-[#0083BF]"
                      onClick={handleDownloadPDF}
                    >
                      <Download className="h-4 w-4" />
                      <span>Download PDF</span>
                    </Button>
                  </div>

                  <div id="result-content" ref={resultContentRef}>
                    <div className="prose max-w-none">
                      {formatAnswer(results.answer)}
                    </div>

                    {/* Sources */}
                    {results.sources &&
                      Object.keys(results.sources).length > 0 && (
                        <SourcesDisplay sources={results.sources} />
                      )}
                  </div>

                  {/* Want More Information & Ask Colleague */}
                  <div className="mt-10 border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium mb-4 text-center">
                      Want More Information?
                    </h3>
                    <div className="flex justify-center space-x-4">
                      <Button
                        className="hidden bg-[#0083BF] hover:bg-[#006a9e] text-white px-8"
                        onClick={() => setShowChat(true)}
                      >
                        Yes
                      </Button>
                      <Button
                        variant="outline"
                        className="hidden border-[#0083BF] text-[#0083BF] hover:bg-[#e6f7ff] px-8"
                        onClick={() => onWantMoreInfo(false)}
                      >
                        No
                      </Button>
                      <Button
                        variant="outline"
                        className="border-[#0083BF] text-[#0083BF] hover:bg-[#e6f7ff] px-8 flex items-center gap-1"
                        onClick={() => setIsAskColleagueOpen(true)}
                      >
                        <UserPlus className="h-4 w-4" />
                        Ask Colleague
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
                <div className="flex justify-end space-x-2 mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 text-[#0083BF] border-[#0083BF]"
                    onClick={() => setIsEmailDialogOpen(true)}
                  >
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 text-[#0083BF] border-[#0083BF]"
                    onClick={handleDownloadPDF}
                  >
                    <Download className="h-4 w-4" />
                    <span>Download PDF</span>
                  </Button>
                </div>

                <div id="chat-content" className="space-y-6">
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
                          <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-white overflow-hidden border border-gray-200">
                            <img
                              src="/hellerLogo.png"
                              alt="Heller Logo"
                              className="w-8 h-8 object-contain"
                            />
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
                            <div className="prose max-w-none break-words markdown">
                              {message.role === "assistant" ? (
                                formatAnswer(message.content)
                              ) : (
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {message.content}
                                </ReactMarkdown>
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
                      <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-white overflow-hidden border border-gray-200">
                        <img
                          src="/hellerLogo.png"
                          alt="Heller Logo"
                          className="w-8 h-8 object-contain"
                        />
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
                          // console.log("triggered", e.key);
                          //handleChatSubmit(e);
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
      {/* Email Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Email Results</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email Address</label>
                <Input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="example@company.com"
                  className="mt-1"
                />
              </div>
              <Button
                onClick={handleSendEmail}
                disabled={emailStatus === "sending"}
                className="w-full bg-[#0083BF] hover:bg-[#006a9e]"
              >
                {emailStatus === "idle" && "Send Results"}
                {emailStatus === "sending" && "Sending..."}
                {emailStatus === "success" && "Sent Successfully!"}
                {emailStatus === "error" && "Error - Try Again"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Ask Colleague Dialog */}
      <Dialog open={isAskColleagueOpen} onOpenChange={setIsAskColleagueOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ask a Colleague</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  Colleague Email Addresses
                </label>
                <div className="text-xs text-gray-500 mb-1">
                  Separate multiple emails with commas
                </div>
                <Input
                  type="text"
                  value={colleagueEmails}
                  onChange={(e) => setColleagueEmails(e.target.value)}
                  placeholder="colleague1@company.com, colleague2@company.com"
                  className="mt-1"
                />
              </div>
              <div className="text-sm">
                <p>Your colleagues will receive an email with your question:</p>
                <Textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  className="mt-2 p-2 rounded w-full"
                />
              </div>
              <Button
                onClick={handleAskColleague}
                disabled={askColleagueStatus === "sending"}
                className="w-full bg-[#0083BF] hover:bg-[#006a9e]"
              >
                {askColleagueStatus === "idle" && "Send Request"}
                {askColleagueStatus === "sending" && "Sending..."}
                {askColleagueStatus === "success" && "Sent Successfully!"}
                {askColleagueStatus === "error" && "Error - Try Again"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
