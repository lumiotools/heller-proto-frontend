// API client for Heller backend
export interface ApiResponse {
  answer: string;
  sources: Record<string, { page: number; relevance: number }[]>;
}

export async function queryHellerApi(question: string): Promise<ApiResponse> {
  // Try different request configurations if the first one fails
  const configs: RequestInit[] = [
    // Standard configuration
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      } as Record<string, string>, // Ensure headers conform to HeadersInit
      body: JSON.stringify({ question }),
    },
    // Configuration with CORS settings
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      } as Record<string, string>,
      body: JSON.stringify({ question }),
      mode: "cors",
      credentials: "omit",
    },
    // Configuration with different content type
    {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      } as Record<string, string>,
      body: JSON.stringify({ question }),
    },
  ];

  let lastError: Error | null = null;

  // Try each configuration until one works
  for (const config of configs) {
    try {
      console.log(`Trying API request with config:`, config);
      // Fix the API endpoint URL - changed from /query/chat to /chat/query
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

      return {
        answer: data.answer || "No answer provided by the API.",
        sources: data.sources || {},
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
