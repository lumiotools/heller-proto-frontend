import { marked } from "marked";

interface SourceData {
  page: number;
  relevance: number;
  text: string | "";
}

interface Sources {
  [key: string]: SourceData[];
}

export async function sendResultsEmail(
  toEmail: string | null | undefined,
  query: string | null | undefined,
  content: string | null | undefined,
  sources: Sources | null | undefined
) {
  // Ensure all values are non-null (default to empty string)
  const safeToEmail = toEmail ?? "";
  const safeQuery = query ?? "";
  const safeContent = content ?? "";
  const safeSources = sources ?? {};

  if (!safeToEmail) {
    console.error("❌ No recipient email provided.");
    return;
  }

  // Convert Markdown content to HTML
  const htmlContent = marked(safeContent);

  // Format sources as an HTML section
  const sourcesHtml = Object.entries(safeSources)
    .map(([source, entries]) => {
      const sourceEntries = entries
        .map((entry) => {
          const page = entry.page ?? 0;
          const relevance = entry.relevance ?? 0;
          const text = entry.text ?? "";
          return `<li>📄 Page ${page} (Relevance: ${relevance}%) - ${text}</li>`;
        })
        .join("");
      return `<h3>🔗 Source: ${source}</h3><ul>${sourceEntries}</ul>`;
    })
    .join("<hr>");

  // Construct final email HTML
  const finalHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd;">
      <h2>🔍 Query: ${safeQuery}</h2>
      <div style="padding: 10px; background-color: #f9f9f9; border-left: 4px solid #007bff;">
        ${htmlContent}
      </div>
      <hr>
      <h3>📚 Sources:</h3>
      ${sourcesHtml || "<p>No sources available.</p>"}
    </div>
  `;

  // Send email using your existing Nodemailer API
  return fetch("/api/send-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: safeToEmail,
      subject: `Response to Your Query: "${safeQuery}"`,
      html: finalHtml,
    }),
  });
}

export async function sendColleagueEmail(
  colleagueEmails: string,
  query: string | null | undefined,
  isValidEmail: (email: string) => boolean
) {
  // Validate and clean email list
  const emails = colleagueEmails
    .split(",")
    .map((e) => e.trim())
    .filter((e) => isValidEmail(e));

  if (emails.length === 0) {
    console.error("❌ No valid email addresses provided.");
    return;
  }

  const safeQuery = query ?? "a question";

  // Construct email content
  const emailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd;">
        <h2>🚀 Your teammate needs help!</h2>
        <p><strong>Query:</strong> "${safeQuery}"</p>
        <p>Please respond to this email with your answer, and it will be added to the Heller database.</p>
        <p>You can also attach documents if needed.</p>
        <p>Best regards,</p>
        <p><strong>Heller AI Assistant</strong></p>
      </div>
    `;

  return fetch("/api/send-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: emails,
      subject: `Your teammate needs help with: ${safeQuery}`,
      html: emailHtml,
    }),
  });
}
