"use client";
import React, { useEffect, useState } from "react";
import MarkdownConverter from "./MarkdownConverter";
import { usePDF } from "react-to-pdf";
import { Button } from "@/components/ui/button";

interface MarkdownContentProps {
  markdownContent: string;
}

const MarkdownContent: React.FC<MarkdownContentProps> = ({
  markdownContent,
}) => {
  const [htmlContent, setHtmlContent] = useState<string>("");
  const getFormattedTimestamp = (): string => {
    const now = new Date();
    return now
      .toISOString()
      .replace(/[:.]/g, "-")
      .replace("T", "_")
      .slice(0, 19); // Gets YYYY-MM-DD_HH-mm-ss format
  };
  const { toPDF, targetRef } = usePDF({
    filename: `CAD_Analysis_Report_${getFormattedTimestamp()}.pdf`,
    page: {
      margin: 30,
      format: "a4",
      orientation: "portrait",
    },
    method: "save",
  });

  useEffect(() => {
    if (!markdownContent) return;

    try {
      const converter = new MarkdownConverter({
        outputDir: "output",
      });
      const { html } = converter.convert(markdownContent);
      setHtmlContent(html);
    } catch (error) {
      console.error("Error converting markdown:", error);
      setHtmlContent("Error converting markdown content");
    }
  }, [markdownContent]);

  const handleDownloadPDF = async () => {
    try {
      await toPDF();
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <div className="relative">
      <Button
        onClick={handleDownloadPDF}
        className="absolute top-0 right-0 bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow-md transition-all flex items-center gap-2"
        aria-label="Download PDF"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        Download PDF
      </Button>
      <div
        ref={targetRef}
        className="markdown-content prose prose-sm max-w-full overflow-hidden mt-12"
      >
        <style jsx global>{`
          .markdown-content {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
              "Helvetica Neue", Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            padding: 20px;
          }
          .markdown-content h1 {
            font-size: 2em;
            margin: 2em 0 1em 0;
            font-weight: 600;
            color: #2563eb;
            page-break-before: always;
            clear: both;
            word-spacing: 0.1em;
            letter-spacing: 0.02em;
            overflow-wrap: break-word;
            hyphens: auto;
            max-width: 100%;
          }
          .markdown-content h1:first-child {
            page-break-before: avoid;
            margin-top: 0;
          }
          .markdown-content h2 {
            font-size: 1.5em;
            margin: 1.5em 0 1em 0;
            font-weight: 600;
            color: #4f46e5;
            page-break-after: avoid;
            clear: both;
            word-spacing: 0.1em;
            letter-spacing: 0.02em;
            overflow-wrap: break-word;
            hyphens: auto;
            max-width: 100%;
          }
          .markdown-content h3 {
            font-size: 1.25em;
            margin: 1.25em 0 0.75em 0;
            font-weight: 600;
            color: #7c3aed;
            page-break-after: avoid;
            clear: both;
            word-spacing: 0.08em;
            letter-spacing: 0.015em;
            overflow-wrap: break-word;
            hyphens: auto;
            max-width: 100%;
          }
          .markdown-content h4 {
            font-size: 1.1em;
            margin: 1em 0 0.5em 0;
            font-weight: 600;
            color: #6d28d9;
            page-break-after: avoid;
            clear: both;
            word-spacing: 0.08em;
            letter-spacing: 0.015em;
            overflow-wrap: break-word;
            hyphens: auto;
            max-width: 100%;
          }
          .markdown-content .section-heading {
            display: inline-block;
            word-break: break-word;
            word-wrap: break-word;
            overflow-wrap: break-word;
            max-width: 100%;
          }
          .markdown-content ul,
          .markdown-content ol {
            padding-left: 2em;
            margin: 0.75em 0;
            page-break-inside: avoid;
          }
          .markdown-content li {
            margin: 0.5em 0;
            line-height: 1.6;
          }
          .markdown-content p {
            margin: 0.75em 0;
            line-height: 1.6;
            page-break-inside: avoid;
          }
          .markdown-content table {
            border-collapse: collapse;
            width: 100%;
            margin: 1.5em 0;
            page-break-inside: avoid;
          }
          .markdown-content th,
          .markdown-content td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
          }
          .markdown-content th {
            background-color: #f8fafc;
          }
          .markdown-content > * + * {
            margin-top: 1em;
          }
          @media print {
            .markdown-content {
              padding: 0;
            }
            .markdown-content h1 {
              margin-top: 2em;
            }
            .markdown-content h1,
            .markdown-content h2,
            .markdown-content h3,
            .markdown-content h4 {
              word-spacing: 0.1em;
              letter-spacing: 0.02em;
              overflow-wrap: break-word;
              word-break: break-word;
              hyphens: auto;
            }
          }
        `}</style>
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </div>
    </div>
  );
};

export default MarkdownContent;
