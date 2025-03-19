"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut } from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  pageNumber: number;
  snippet: string;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  isOpen,
  onClose,
  pdfUrl,
  pageNumber,
  snippet,
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(pageNumber);
  const [scale, setScale] = useState(1);
  const [containerWidth, setContainerWidth] = useState(800);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentPage(pageNumber);
  }, [pageNumber]);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        // Leave some padding to avoid scrollbars
        const newWidth = containerRef.current.clientWidth - 40;
        setContainerWidth(newWidth);
      }
    };

    // Initial set
    updateWidth();

    // Update on resize
    const resizeObserver = new ResizeObserver(updateWidth);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, [isOpen]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const customTextRenderer = (textItem: { str: string }) => {
    const { str } = textItem;
    if (!str) return str;

    if (str.includes("<mark>") || str === " ") {
      return str;
    } else if (snippet && snippet.toLowerCase().includes(str.toLowerCase())) {
      return `<mark>${str}</mark>`;
    }
    return str;
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= (numPages || 1)) {
      setCurrentPage(newPage);
    }
  };

  const handleZoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 0.2, 3));
  };

  const handleZoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.2, 0.5));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-fit h-full overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>Document Viewer</DialogTitle>
          <DialogDescription className="flex items-center justify-between">
            <span>
              Page {currentPage} of {numPages || 0}
            </span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handleZoomOut}>
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-xs min-w-8 text-center">
                {Math.round(scale * 100)}%
              </span>
              <Button size="sm" variant="outline" onClick={handleZoomIn}>
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div ref={containerRef} className="flex-1 overflow-auto h-full w-full">
          <div className="flex justify-center min-h-full py-4">
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="flex items-center justify-center h-40">
                  Loading document...
                </div>
              }
              error={
                <div className="text-red-500">Failed to load PDF document</div>
              }
            >
              <Page
                pageNumber={currentPage}
                scale={scale}
                width={containerWidth}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                customTextRenderer={
                  pageNumber === currentPage && snippet
                    ? customTextRenderer
                    : undefined
                }
              />
            </Document>
          </div>
        </div>

        <div className="flex justify-center items-center gap-4 mt-2 shrink-0">
          <Button
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            Previous
          </Button>
          <span className="min-w-16 text-center">
            {currentPage} / {numPages || 0}
          </span>
          <Button
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= (numPages || 1)}
          >
            Next
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
