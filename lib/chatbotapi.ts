// API client for Heller backend with chat history support
export interface ApiResponse {
  answer: string;
  sources: Record<
    string,
    { page: number; relevance: number; text: string | "" }[]
  >;
  conversation_id: string | null; // Allow conversation_id to be null
}

// Define a proper interface for chat history messages
export interface ChatHistoryMessage {
  role: "user" | "assistant"; // Make this more specific
  content: string;
  sources?: Record<string, { page: number; relevance: number }[]>;
}

// Define a structure for storing both search results and chat history
export interface StoredSearchData {
  query: string;
  results: ApiResponse;
  chatHistory: ChatHistoryMessage[];
  timestamp: number;
}

// Keep track of the current conversation
let currentConversationId: string | null = null;

export async function queryHellerApi(
  question: string,
  existingConversationId: string | null = null
): Promise<ApiResponse> {
  // If an existing conversation ID is provided, use it
  if (existingConversationId) {
    currentConversationId = existingConversationId;
  }

  // Check if we already have results for this query
  const savedData = getSearchResults(question);
  if (savedData) {
    console.log("Using cached search results for:", question);
    // If we have saved results, use the conversation_id from there
    if (savedData.results.conversation_id) {
      currentConversationId = savedData.results.conversation_id;
    }
    return savedData.results;
  }

  // Prepare the request body including conversation_id if available
  const requestBody = {
    question,
    top_k: 5,
    ...(currentConversationId && { conversation_id: currentConversationId }),
  };

  // Try different request configurations if the first one fails
  const configs: RequestInit[] = [
    // Standard configuration
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      } as Record<string, string>,
      body: JSON.stringify(requestBody),
    },
    // Configuration with CORS settings
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      } as Record<string, string>,
      body: JSON.stringify(requestBody),
      mode: "cors",
      credentials: "omit",
    },
    // Configuration with different content type
    {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      } as Record<string, string>,
      body: JSON.stringify(requestBody),
    },
  ];

  let lastError: Error | null = null;

  // Try each configuration until one works
  for (const config of configs) {
    try {
      console.log(`Trying API request with config:`, config);
      const response = await fetch(
        "https://heller-proto-backend-j9yd.onrender.com/chat/query2",
        config
      );

      if (!response.ok) {
        const errorText = await response
          .text()
          .catch(() => "No error details available");
        console.warn(
          `API responded with status ${response.status}:`,
          errorText
        );
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API response successful:", data);

      // Store the conversation ID for future requests
      if (data.conversation_id) {
        currentConversationId = data.conversation_id;
      }

      const result = {
        answer: data.answer || "No answer provided by the API.",
        sources: data.sources || {},
        conversation_id: data.conversation_id || null,
      };

      // Save the search results
      saveSearchResults(question, result);

      return result;
    } catch (error) {
      console.warn("API request failed:", error);
      lastError = error instanceof Error ? error : new Error(String(error));
      // Continue to the next configuration
    }
  }

  // If we get here, all configurations failed
  throw (
    lastError ||
    new Error("Failed to fetch response after trying all configurations")
  );
}

// Function to start a new conversation
export function startNewConversation(): void {
  currentConversationId = null;
  console.log("Started a new conversation");
}

// Save search results to localStorage
export function saveSearchResults(query: string, results: ApiResponse): void {
  try {
    // Get existing search data
    const existingDataStr = localStorage.getItem("hellerSearchData");
    const searchData: Record<string, StoredSearchData> = existingDataStr
      ? JSON.parse(existingDataStr)
      : {};

    // Get existing chat history if any
    const chatHistory = getChatHistory(query) || [];

    // Save or update the search data
    searchData[query] = {
      query,
      results,
      chatHistory,
      timestamp: Date.now(),
    };

    // Save back to localStorage
    localStorage.setItem("hellerSearchData", JSON.stringify(searchData));
    console.log(`Saved search results for query: ${query}`);
  } catch (error) {
    console.error("Error saving search results:", error);
  }
}

// Get search results from localStorage
export function getSearchResults(query: string): StoredSearchData | null {
  try {
    const existingDataStr = localStorage.getItem("hellerSearchData");
    if (!existingDataStr) return null;

    const searchData = JSON.parse(existingDataStr);
    return searchData[query] || null;
  } catch (error) {
    console.error("Error retrieving search results:", error);
    return null;
  }
}

// Add a function to save chat history to localStorage
export function saveChatHistory(query: string, messages: ChatHistoryMessage[]) {
  try {
    // Get existing search data
    const existingDataStr = localStorage.getItem("hellerSearchData");
    const searchData: Record<string, StoredSearchData> = existingDataStr
      ? JSON.parse(existingDataStr)
      : {};

    // If we have an entry for this query, update the chat history
    if (searchData[query]) {
      searchData[query].chatHistory = messages;
    } else {
      // Otherwise create a new entry (this shouldn't normally happen)
      searchData[query] = {
        query,
        results: {
          answer: "",
          sources: {},
          conversation_id: null,
        },
        chatHistory: messages,
        timestamp: Date.now(),
      };
    }

    // Save back to localStorage
    localStorage.setItem("hellerSearchData", JSON.stringify(searchData));
    console.log(`Saved chat history for query: ${query}`);
  } catch (error) {
    console.error("Error saving chat history:", error);
  }
}

// Add a function to get chat history for a specific query
export function getChatHistory(query: string): ChatHistoryMessage[] | null {
  try {
    const searchData = getSearchResults(query);
    return searchData?.chatHistory || null;
  } catch (error) {
    console.error("Error retrieving chat history:", error);
    return null;
  }
}

// Get all search history with timestamps
export function getAllSearchHistory(): { query: string; timestamp: number }[] {
  try {
    const existingDataStr = localStorage.getItem("hellerSearchData");
    if (!existingDataStr) return [];

    const searchData = JSON.parse(existingDataStr) as Record<
      string,
      StoredSearchData
    >;

    return Object.values(searchData)
      .map((item: StoredSearchData) => ({
        query: item.query,
        timestamp: item.timestamp,
      }))
      .sort((a, b) => b.timestamp - a.timestamp); // Sort by most recent first
  } catch (error) {
    console.error("Error retrieving search history:", error);
    return [];
  }
}
