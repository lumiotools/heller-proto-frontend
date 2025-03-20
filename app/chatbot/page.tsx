/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import ChatInterface from "../ui/chat-interface";
import SearchResults from "../ui/search-results";
import {
  queryHellerApi,
  startNewConversation,
  getAllSearchHistory,
  getSearchResults,
  type ApiResponse,
  type ChatHistoryMessage,
} from "@/lib/chatbotapi";

// Update the Home component to maintain search history across searches
export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  // Update the searchResults state to use proper type
  const [searchResults, setSearchResults] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [view, setView] = useState<"landing" | "search-results" | "chat">(
    "landing"
  );
  // Add a state to track search history
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  // Add a state to store all search data in memory
  // Update the searchData state to use proper type
  interface SearchDataItem {
    results: ApiResponse;
    chatHistory: ChatHistoryMessage[];
    timestamp: number;
  }

  const [searchData, setSearchData] = useState<Record<string, SearchDataItem>>(
    {}
  );

  // Load search history and data from localStorage on initial load
  useEffect(() => {
    // Load search history
    const history = getAllSearchHistory();
    if (history.length > 0) {
      setSearchHistory(history.map((item) => item.query));

      // Also load all search data into state
      const searchDataObj: Record<string, SearchDataItem> = {};
      history.forEach((item) => {
        const savedData = getSearchResults(item.query);
        if (savedData) {
          searchDataObj[item.query] = {
            results: savedData.results,
            chatHistory: savedData.chatHistory || [],
            timestamp: savedData.timestamp,
          };
        }
      });

      setSearchData(searchDataObj);
    }
  }, []);

  // Update the handleSearch function to store data in state
  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    // Check if we already have this search in our state
    if (searchData[query]) {
      setSearchQuery(query);
      setSearchResults(searchData[query].results);
      setView("search-results");

      // Update search history order
      setSearchHistory((prev) => {
        const filteredHistory = prev.filter((item) => item !== query);
        return [query, ...filteredHistory];
      });
      return;
    }

    // Set loading immediately
    setIsLoading(true);
    setSearchQuery(query);
    // Change view to search-results to show loading screen
    setView("search-results");

    try {
      // Start a new conversation for each new search
      startNewConversation();
      const result = await queryHellerApi(query);
      setSearchResults(result);

      // Store in our state
      setSearchData((prev) => ({
        ...prev,
        [query]: {
          results: result,
          chatHistory: [],
          timestamp: Date.now(),
        },
      }));

      // Update search history
      setSearchHistory((prev) => {
        // Remove the query if it already exists to avoid duplicates
        const filteredHistory = prev.filter((item) => item !== query);
        // Add the new query at the beginning
        return [query, ...filteredHistory];
      });
    } catch (error) {
      console.error("Search error:", error);
      // If there's an error, still show chat interface with error message
      setShowChat(true);
      setView("chat");
    } finally {
      setIsLoading(false);
    }
  };

  // Update the handleHistoryItemClick function to properly handle history clicks
  const handleHistoryItemClick = (historyQuery: string) => {
    // First check our in-memory state
    if (searchData[historyQuery]) {
      setSearchQuery(historyQuery);
      setSearchResults(searchData[historyQuery].results);
      setView("search-results");

      // Update search history order
      // setSearchHistory((prev) => {
      //   const filteredHistory = prev.filter((item) => item !== historyQuery);
      //   return [historyQuery, ...filteredHistory];
      // });
      return;
    }

    // If not in memory, check localStorage
    const savedData = getSearchResults(historyQuery);

    if (savedData) {
      // Use the saved results instead of making a new API call
      setSearchQuery(historyQuery);
      setSearchResults(savedData.results);

      // Also update our in-memory state
      setSearchData((prev) => ({
        ...prev,
        [historyQuery]: {
          results: savedData.results,
          chatHistory: savedData.chatHistory || [],
          timestamp: savedData.timestamp,
        },
      }));

      setView("search-results");

      // Update search history order
      setSearchHistory((prev) => {
        const filteredHistory = prev.filter((item) => item !== historyQuery);
        return [historyQuery, ...filteredHistory];
      });
    } else {
      // If no saved results, make a new search
      handleSearch(historyQuery);
    }
  };

  // Update the handleWantMoreInfo function to not change the view
  const handleWantMoreInfo = (wantMore: boolean) => {
    if (!wantMore) {
      // Reset for a new search
      setSearchResults(null);
      setSearchQuery("");
      setView("landing");
    }
    // We no longer need to set showChat or change view here
    // The chat functionality is now embedded in the search results component
  };

  // Update the handleBackToLanding function to go directly to search tab
  const handleBackToLanding = () => {
    setView("landing");
    setSearchResults(null);
    setSearchQuery("");
    setShowChat(false);
    // Don't clear search history when going back to landing

    // Set a flag to indicate we should show the search tab
    sessionStorage.setItem("showSearchTab", "true");
  };

  // Add a useEffect to check if we should show the search tab
  useEffect(() => {
    if (view === "landing") {
      const shouldShowSearch = sessionStorage.getItem("showSearchTab");
      if (shouldShowSearch === "true") {
        // Clear the flag
        sessionStorage.removeItem("showSearchTab");

        // Find the ChatInterface component and set its activeTab to "search"
        const chatInterface = document.querySelector("[data-active-tab]");
        if (chatInterface) {
          chatInterface.setAttribute("data-active-tab", "search");
        }
      }
    }
  }, [view]);

  return (
    <div className="min-h-[calc(100vh-4rem)] relative bg-white">
      {view === "search-results" ? (
        // Update the handleUpdateChatHistory function type in the SearchResults component
        <SearchResults
          query={searchQuery}
          results={searchResults}
          onWantMoreInfo={handleWantMoreInfo}
          onBackToLanding={handleBackToLanding}
          isLoading={isLoading}
          searchHistory={searchHistory}
          onSearch={handleHistoryItemClick}
          onUpdateChatHistory={(
            query: string,
            messages: ChatHistoryMessage[]
          ) => {
            setSearchData((prev) => ({
              ...prev,
              [query]: {
                ...prev[query],
                chatHistory: messages,
                timestamp: Date.now(),
              },
            }));
          }}
        />
      ) : view === "chat" ? (
        <ChatInterface
          initialSearchQuery={searchQuery}
          initialSearchResults={searchResults}
          showChatMode={true}
          onSearch={handleSearch}
          onBackToResults={() => setView("search-results")}
          onBackToLanding={handleBackToLanding}
          isLoading={isLoading}
        />
      ) : (
        <ChatInterface
          initialSearchQuery=""
          initialSearchResults={null}
          showChatMode={false}
          onSearch={handleSearch}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
