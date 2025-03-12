// API client for Heller backend with chat history support
export interface ApiResponse {
  answer: string;
  sources: Record<string, { page: number; relevance: number }[]>;
  conversation_id: string; // Added to store the conversation ID
}

// Keep track of the current conversation
let currentConversationId: string | null = null;

export async function queryHellerApi(question: string): Promise<ApiResponse> {
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
        "https://heller-proto-backend.onrender.com/chat/query",
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

      return {
        answer: data.answer || "No answer provided by the API.",
        sources: data.sources || {},
        conversation_id: data.conversation_id || null,
      };
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
