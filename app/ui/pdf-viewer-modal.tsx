/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect, useRef } from "react";
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
import { ZoomIn, ZoomOut, RotateCw, Maximize } from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  pageNumber: number;
  snippet: string;
}

interface PageDetails {
  width: number;
  height: number;
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
  const [scale, setScale] = useState(1); // Default to 100% zoom
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [pageDetails, setPageDetails] = useState<PageDetails | null>(null);
  const [rotation, setRotation] = useState(0);
  const [fitToWidth, setFitToWidth] = useState(false); // Default to exact size, not fit width
  const containerRef = useRef<HTMLDivElement>(null);
  const scaleWasSetRef = useRef(false);

  // Reset when opening the modal, but keep scale at 1 (100%)
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(pageNumber);
      setRotation(0);
      // Keep scale at 1 (100%) instead of auto-fitting
      setScale(1);
      // Don't set this to false so it doesn't trigger auto-scaling
      // scaleWasSetRef.current = false;
    }
  }, [isOpen, pageNumber]);

  // Update container dimensions when the dialog opens or resizes
  useEffect(() => {
    const updateContainerDimensions = () => {
      if (containerRef.current) {
        const newWidth = containerRef.current.clientWidth - 40;
        const newHeight = containerRef.current.clientHeight - 40;
        setContainerWidth(newWidth);
        setContainerHeight(newHeight);
      }
    };

    if (isOpen) {
      // Initial update
      updateContainerDimensions();

      // Add a small delay for the dialog animation to complete
      const timer = setTimeout(updateContainerDimensions, 300);

      // Add resize observer
      const resizeObserver = new ResizeObserver(() => {
        updateContainerDimensions();
      });

      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }

      return () => {
        clearTimeout(timer);
        if (containerRef.current) {
          resizeObserver.unobserve(containerRef.current);
        }
      };
    }
  }, [isOpen]);

  // This effect is modified to only apply fit-to-width when the button is clicked
  useEffect(() => {
    if (fitToWidth && pageDetails && containerWidth > 0) {
      const isLandscape = rotation === 90 || rotation === 270;
      const pageWidth = isLandscape ? pageDetails.height : pageDetails.width;
      const newScale = containerWidth / pageWidth;
      setScale(newScale);
    }
  }, [fitToWidth, pageDetails, containerWidth, rotation]);

  // Document load success handler
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }): void => {
    setNumPages(numPages);
  };

  // Page load success handler - no auto-scaling
  const onPageLoadSuccess = (page: { width: number; height: number }): void => {
    setPageDetails({
      width: page.width,
      height: page.height,
    });

    // No auto-scaling on page load
  };

  // Custom text renderer for highlighting search terms
  const customTextRenderer = (textItem: { str: string }): string => {
    const { str } = textItem;
    if (!str) return str;

    if (str.includes("<mark>") || str === " ") {
      return str;
    } else if (snippet && snippet.toLowerCase().includes(str.toLowerCase())) {
      return `<mark>${str}</mark>`;
    }
    return str;
  };

  // Navigation handlers
  const handlePageChange = (newPage: number): void => {
    if (newPage >= 1 && newPage <= (numPages || 1)) {
      setCurrentPage(newPage);
    }
  };

  // Zoom handlers
  const handleZoomIn = (): void => {
    setFitToWidth(false);
    setScale((prevScale) => Math.min(prevScale + 0.2, 3));
  };

  const handleZoomOut = (): void => {
    setFitToWidth(false);
    setScale((prevScale) => Math.max(prevScale - 0.2, 0.5));
  };

  // Rotation handler
  const handleRotate = (): void => {
    setRotation((prevRotation) => (prevRotation + 90) % 360);
  };

  // Fit to width handler
  const handleFitToWidth = (): void => {
    if (!pageDetails) return;

    // Toggle fit to width
    const newFitToWidth = !fitToWidth;
    setFitToWidth(newFitToWidth);

    if (newFitToWidth) {
      // Calculate scale based on rotation
      const isLandscape = rotation === 90 || rotation === 270;
      const pageWidth = isLandscape ? pageDetails.height : pageDetails.width;

      if (containerWidth > 0) {
        const newScale = containerWidth / pageWidth;
        setScale(newScale);
      }
    } else {
      // Reset to 100% when turning off fit to width
      setScale(1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-[90vw] h-[90vh] overflow-hidden flex flex-col">
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
              <Button size="sm" variant="outline" onClick={handleRotate}>
                <RotateCw className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={fitToWidth ? "default" : "outline"}
                onClick={handleFitToWidth}
              >
                <Maximize className="w-4 h-4" />
              </Button>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div ref={containerRef} className="flex-1 overflow-auto h-full w-full">
          <div
            className="flex justify-center min-h-full py-4"
            style={{
              transform: rotation ? `rotate(${rotation}deg)` : "none",
              transformOrigin: "center center",
              height: "100%",
            }}
          >
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
                rotate={rotation}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                onLoadSuccess={onPageLoadSuccess}
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
