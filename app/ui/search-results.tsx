/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import type React from "react";
import { useState, useRef, useEffect } from "react";
import {
  Send,
  ChevronLeft,
  FileText,
  Download,
  Mail,
  X,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { PdfViewerModal } from "../ui/pdf-viewer-modal";
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
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

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
    localPath:
      "/docs/2043MK7 System User Manual - Flux Reactor Maintenance.pdf",
  },
  {
    filename: "848861 REACTOR UPGRADE TEST Retrofit (R2).xlsx",
    link: "https://docs.google.com/spreadsheets/d/1I4rKI4aEW6XXjQ6PuX2JY-1tOJBSSe8W/edit?usp=sharing&ouid=111377379083910385195&rtpof=true&sd=true",
    localPath: "/docs/848861 REACTOR UPGRADE TEST Retrofit (R2).xlsx",
  },
  {
    filename: "854508 Reactor Catalyst Remove Retrofit (R1).xls",
    link: "https://docs.google.com/spreadsheets/d/1raFr_s729zOelX32wUEyoRogoFW7iLzy/edit?usp=sharing&ouid=111377379083910385195&rtpof=true&sd=true",
    localPath: "/docs/854508 Reactor Catalyst Remove Retrofit (R1).xls",
  },
  {
    filename: "4177290 (rev. A).pdf",
    link: "https://drive.google.com/file/d/1Njp7QsRF3AwoEu9DbQTO22UIizWVJ_gF/view?usp=sharing",
    localPath: "/docs/4177290 (rev. A).pdf",
  },
  {
    filename: "4188290 (rev. A).pdf",
    link: "https://drive.google.com/file/d/1iLM2FgaNWjrF4pEBb3zRx542VjjZtrtO/view?usp=sharing",
    localPath: "/docs/4188290 (rev. A).pdf",
  },
  {
    filename:
      "4196387-Instructions  for Reactor Upgrade Retrofit (A)_RFC-355.pdf",
    link: "https://drive.google.com/file/d/1HaCNL5PmP6ONPtNL0jcYr7rHVm6o3X2B/view?usp=sharing",
    localPath:
      "/docs/4196387-Instructions  for Reactor Upgrade Retrofit (A)_RFC-355.pdf",
  },
  {
    filename:
      "4224364-Instruction  For Reactor Catalyst Remove Retrofit(A).pdf",
    link: "https://drive.google.com/file/d/156qAD4F-I8HzQ1uVSHDpbDKG0VuWdlJd/view?usp=sharing",
    localPath:
      "/docs/4224364-Instruction  For Reactor Catalyst Remove Retrofit(A).pdf",
  },
  {
    filename: "ALPHA zeolite and catalyst (7-26-22) abridged.pdf",
    link: "https://drive.google.com/file/d/1WOlwn2_2vwFbvGIxIg3ow6AbX2dTOaPt/view?usp=sharing",
    localPath: "/docs/ALPHA zeolite and catalyst (7-26-22) abridged.pdf",
  },
  {
    filename: "Heller Flux Reactor Overview (4-11-23).pdf",
    link: "https://drive.google.com/file/d/1c_uoS2NBQ5C87samRf5yE0pIz1WGGiXz/view?usp=sharing",
    localPath: "/docs/Heller Flux Reactor Overview (4-11-23).pdf",
  },
  {
    filename:
      "Reactor Return Gas into Big Flux box Test with Heat Exchanger Water OFF (RFC355).pdf",
    link: "https://drive.google.com/file/d/1aIQC2PZejl6RDHF9ewY1ymgVj_-sL5Ye/view?usp=sharing",
    localPath:
      "/docs/Reactor Return Gas into Big Flux box Test with Heat Exchanger Water OFF (RFC355).pdf",
  },
  {
    filename:
      "RFC-355  Reactor Catalyst Upgrade And Return Gas Into Flux Box.pdf",
    link: "https://drive.google.com/file/d/1PxlqRdSr4fqqlTKkxiIaophIfkIRDSld/view?usp=sharing",
    localPath:
      "/docs/RFC-355  Reactor Catalyst Upgrade And Return Gas Into Flux Box.pdf",
  },
];

// Custom CSS to properly render markdown
const markdownStyles = `
.markdown h1 { font-size: 2em; font-weight: bold; margin-top: 1em; margin-bottom: 0.5em; }
.markdown h2 { font-size: 1.5em; font-weight: bold; margin-top: 1em; margin-bottom: 0.5em; }
.markdown h3 { font-size: 1.17em; font-weight: bold; margin-top: 1em; margin-bottom: 0.5em; }
.markdown h4 { font-size: 1em; font-weight: bold; margin-top: 1em; margin-bottom: 0.5em; }
.markdown h5 { font-size: 0.83em; font-weight: bold; margin-top: 1em; margin-bottom: 0.5em; }
.markdown h6 { font-size: 0.67em; font-weight: bold; margin-top: 1em; margin-bottom: 0.5em; }
.markdown strong { font-weight: bold; }
.markdown em { font-style: italic; }
.markdown ul { list-style-type: disc; padding-left: 2em; margin: 1em 0; }
.markdown ol { list-style-type: decimal; padding-left: 2em; margin: 1em 0; }
.markdown blockquote { border-left: 4px solid #e5e7eb; padding-left: 1em; margin: 1em 0; color: #4b5563; }
.markdown pre { background-color: #f3f4f6; padding: 1em; border-radius: 0.375em; overflow-x: auto; margin: 1em 0; }
.markdown code { font-family: monospace; background-color: #f3f4f6; padding: 0.2em 0.4em; border-radius: 0.25em; }
.markdown a { color: #0083BF; text-decoration: underline; }
.markdown table { border-collapse: collapse; width: 100%; margin: 1em 0; }
.markdown th, .markdown td { border: 1px solid #e5e7eb; padding: 0.5em; text-align: left; }
.markdown th { background-color: #f9fafb; }
`;

// Improved formatAnswer function with proper markdown styling
const formatAnswer = (answer: string) => {
  return (
    <div className="markdown prose max-w-none">
      <style>{markdownStyles}</style>
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
const generatePDF = (content: string, filename: string) => {
  const contentElement = document.getElementById(content);
  if (!contentElement) return;

  html2canvas(contentElement, {
    scale: 2,
    useCORS: true,
    logging: false,
  }).then((canvas) => {
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(filename);
  });
};

// Component to display sources consistently
const SourcesDisplay = ({
  sources,
  messageId = null,
}: {
  sources: Record<string, { page: number; relevance: number; text?: string }[]>;
  messageId?: string | null;
}) => {
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<{
    url: string;
    page: number;
    snippet: string;
  } | null>(null);

  if (!sources || Object.keys(sources).length === 0) return null;

  const handleOpenPdf = (filename: string, page: number, text = "") => {
    // Find the link for this filename
    const linkInfo = linksArray.find(
      (item) =>
        item.filename.toLowerCase().includes(filename.toLowerCase()) ||
        filename.toLowerCase().includes(item.filename.toLowerCase())
    );

    if (linkInfo && linkInfo.localPath.endsWith(".pdf")) {
      setSelectedPdf({
        url: linkInfo.localPath,
        page,
        snippet: text,
      });
      setIsPdfOpen(true);
    }
  };

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
            <div key={index} className="flex flex-col">
              <a
                href={linkInfo?.link || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#0083BF] hover:text-[#006a9e] transition-colors group bg-[#F5FBFF] hover:bg-[#E6F7FF] px-4 py-2 rounded-md"
              >
                <FileText className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">{filename}</span>
              </a>
              <div className="ml-4 mt-2 space-y-1">
                {sortedPages.map((page, pageIndex) => (
                  <div
                    key={pageIndex}
                    className="text-sm cursor-pointer hover:underline text-[#0083BF] flex items-start"
                    onClick={() =>
                      handleOpenPdf(filename, page.page, page.text || "")
                    }
                  >
                    <span className="mr-1">Page {page.page}</span>
                    {page.text && (
                      <span className="text-gray-600 text-xs italic">
                        - &ldquo;{page.text.substring(0, 50)}
                        {page.text.length > 50 ? "..." : ""}&rdquo;
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {selectedPdf && (
        <PdfViewerModal
          isOpen={isPdfOpen}
          onClose={() => setIsPdfOpen(false)}
          pdfUrl={selectedPdf.url}
          pageNumber={selectedPdf.page}
          snippet={selectedPdf.snippet}
        />
      )}
    </div>
  );
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

  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultContentRef = useRef<HTMLDivElement>(null);

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
      // Simulate email sending with timeout
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Construct email content with the query and results
      const emailContent = {
        to: emailInput,
        subject: `Heller AI Search Results for: ${query}`,
        body: `
          <h2>Search Query: ${query}</h2>
          <div>${results?.answer || "No results available"}</div>
          <h3>Sources:</h3>
          <ul>
            ${
              results?.sources
                ? Object.keys(results.sources)
                    .map((source) => `<li>${source}</li>`)
                    .join("")
                : "No sources available"
            }
          </ul>
        `,
      };

      console.log("Email sent:", emailContent);
      setEmailStatus("success");

      // Reset after success
      setTimeout(() => {
        setIsEmailDialogOpen(false);
        setEmailInput("");
        setEmailStatus("idle");
      }, 1500);
    } catch (error) {
      console.error("Error sending email:", error);
      setEmailStatus("error");

      // Reset after error
      setTimeout(() => {
        setEmailStatus("idle");
      }, 1500);
    }
  };

  // Handle asking a colleague
  const handleAskColleague = async () => {
    // Check if emails are valid (split by commas and validate each)
    const emails = colleagueEmails.split(",").map((e) => e.trim());
    const allValid = emails.every((email) => isValidEmail(email));

    if (!colleagueEmails.trim() || !allValid) {
      alert("Please enter valid email addresses (comma separated)");
      return;
    }

    setAskColleagueStatus("sending");

    try {
      // Simulate email sending with timeout
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Construct email content for colleagues
      const emailContent = {
        to: emails,
        subject: `Your teammate needs help with: ${query}`,
        body: `
          Hey there,
          
          Your teammate has asked you: "${query}"
          
          Please respond to this email to answer and it will get added to the Heller database. 
          You can also attach documents.
          
          Best regards,
          Heller AI Assistant
        `,
      };

      console.log("Colleague request sent:", emailContent);
      setAskColleagueStatus("success");

      // Reset after success
      setTimeout(() => {
        setIsAskColleagueOpen(false);
        setColleagueEmails("");
        setAskColleagueStatus("idle");
      }, 1500);
    } catch (error) {
      console.error("Error sending colleague request:", error);
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
    <div className="flex h-[calc(100vh-80px)] bg-white mt-8 ml-5">
      {/* History Sidebar - Fixed height with overflow-y-auto */}
      {/* History Sidebar - Fixed to make history properly scrollable */}
      {/* History Sidebar - Properly fixed for scrolling */}
      <div className="w-64 hidden md:flex flex-col h-[calc(100vh-140px)] ">
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
                No search history yet
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
              <h1 className="text-xl font-medium mb-6">
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
                              <style>{markdownStyles}</style>
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
                  value={query}
                  onChange={(e) => onSearch(e.target.value)} // Update the query state
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
