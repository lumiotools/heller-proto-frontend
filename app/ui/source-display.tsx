"use client";
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type React from "react";
import { useState } from "react";
import {
  FileText,
} from "lucide-react";
import { PdfViewerModal } from "../ui/pdf-viewer-modal";

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

// Component to display sources consistently
export const SourcesDisplay = ({
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