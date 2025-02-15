"use client";

import React, { useState, useEffect, useRef } from "react";
import { Upload, Clock, Image } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import MarkdownContent from "./MarkdownContent";

interface APIResponse {
  markdown_report: string;
  detail?: string;
}

interface ImageInfo {
  filename: string;
  mime_type: string;
  data: string;
  size: number;
}

interface ImageAPIResponse {
  message: string;
  original_filename: string;
  images: ImageInfo[];
  processing_time_seconds: number;
}

export default function CADUploadButton() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [markdownReport, setMarkdownReport] = useState<string | null>(null);
  const [timer, setTimer] = useState<number>(0);
  const [totalTime, setTotalTime] = useState<number | null>(null);
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [originalFilename, setOriginalFilename] = useState<string>("");
  const [isLoadingImages, setIsLoadingImages] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setTimer(0);
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    } else {
      if (timer > 0) setTotalTime(timer);
      setTimer(0);
    }
    return () => interval && clearInterval(interval);
  }, [isLoading]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    const fileType = selectedFile.name.toLowerCase().split(".").pop();
    if (!["step", "stp", "dxf", "zip", "fcstd"].includes(fileType || "")) {
      setMessage("Please upload only STEP, DXF, FCStd, or ZIP files.");
      return;
    }

    setFile(selectedFile);
    setMessage(null);
    setMarkdownReport(null);
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset file input
    }
  };

  const extractImages = async (uploadedFile: File) => {
    setIsLoadingImages(true);
    const formData = new FormData();
    formData.append("file", uploadedFile);

    try {
      const response = await fetch(`${API_URL}/extract-images`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result: ImageAPIResponse = await response.json();
        setImages(result.images);
        setOriginalFilename(result.original_filename);
      } else {
        console.error("Failed to extract images");
      }
    } catch (error) {
      console.error("Image extraction error:", error);
    } finally {
      setIsLoadingImages(false);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setMessage("Please select a file before submitting.");
      return;
    }
    setIsLoading(true);
    setMarkdownReport(null);

    const fileExt = file.name.toLowerCase().split(".").pop();
    if (fileExt === "zip" || fileExt === "fcstd") {
      await extractImages(file);
    }
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result: APIResponse = await response.json();
        if (result.markdown_report) {
          setMarkdownReport(result.markdown_report);
          setMessage(null);
        } else {
          setMessage("No analysis report was generated.");
        }
      } else {
        const error: APIResponse = await response.json();
        setMessage(`Error: ${error.detail || "Something went wrong"}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMessage(
        `Error: ${
          error instanceof Error ? error.message : "An unknown error occurred"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div
      className={`w-full ${
        images.length > 0 || isLoadingImages || markdownReport
          ? "min-h-[calc(100vh-4rem)] bg-[#F8FAFC]"
          : "h-[calc(100vh-4rem)] bg-[#F8FAFC] flex items-center justify-center"
      } font-montserrat overflow-y-auto`}
    >
      <div
        className={`container ${
          images.length > 0 || isLoadingImages || markdownReport
            ? "py-16 px-4"
            : "px-4"
        }`}
      >
        {/* Main content wrapper with conditional max-width */}
        <div
          className={`mx-auto transition-all duration-300 ease-in-out ${
            images.length > 0 || isLoadingImages || markdownReport
              ? "w-full max-w-7xl"
              : "w-full max-w-lg"
          }`}
        >
          {/* Top Section - Upload and Images */}
          <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
            {/* Upload Section */}
            <div
              className={`w-full ${
                images.length > 0 || isLoadingImages ? "md:w-3/5" : "w-full"
              }`}
            >
              <Card className="bg-white border border-[#0000001A] h-full flex flex-col">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl text-black-900 text-center">
                    CAD File Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-4">
                    <label
                      htmlFor="file-upload"
                      className={`group relative flex flex-col items-center justify-center w-full ${
                        totalTime !== null ? "h-32" : "h-48"
                      } border border-[#0083BF3D] rounded-lg bg-[#0083BF0A] hover:bg-blue-50 transition-all duration-300 cursor-pointer`}
                    >
                      <div className="space-y-2 text-center">
                        <Upload className="mx-auto h-8 w-8 text-[#0083BF]" />
                        <div className="text-sm text-black-900">
                          <span className="font-semibold">Click to upload</span>{" "}
                          or drag and drop
                        </div>
                        <p className="text-xs text-[#0083BF]">
                          STEP (.step, .stp), FreeCAD ZIP (.zip, .FCStd)
                        </p>
                      </div>
                      <input
                        ref={fileInputRef}
                        id="file-upload"
                        type="file"
                        onChange={handleFileChange}
                        accept=".step,.stp,.dxf,.zip,.FCStd"
                        className="hidden"
                      />
                    </label>

                    {file && (
                      <div className="flex justify-between items-center p-4 bg-white border border-[rgba(1,26,46,0.08)] rounded">
                        <div className="flex gap-4">
                          <p className="text-xs font-medium text-[#011A2E]">
                            Selected: {file.name}
                          </p>
                          <p className="text-xs text-[#0083BF]">
                            Size: {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          onClick={handleRemoveFile}
                          className="opacity-60 hover:opacity-100 transition-opacity"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#011A2E"
                            strokeWidth="2"
                          >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    )}

                    <Button
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className="w-full h-10 bg-[#0083BF] hover:bg-[#0083BF]/90 text-white font-semibold rounded"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                          <span>Analyzing... ({formatTime(timer)})</span>
                        </div>
                      ) : (
                        "Analyse CAD File"
                      )}
                    </Button>

                    {message && (
                      <Alert variant="destructive">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{message}</AlertDescription>
                      </Alert>
                    )}
                    {totalTime !== null && (
                      <Alert className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                        <Clock className="h-4 w-4 text-[#0083BF]" />
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[#011A2E]">
                            Analysis Complete
                          </span>
                          <span className="text-sm text-[#0083BF]">
                            Processed in {formatTime(totalTime)}
                          </span>
                        </div>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Images Section */}
            {(images.length > 0 || isLoadingImages) && (
              <div className="w-full md:w-2/5">
                <Card className="bg-white border border-[#0000001A] h-full flex flex-col">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl text-black-900 flex items-center gap-2">
                      <Image className="h-5 w-5" />
                      Images
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col justify-between space-y-4">
                    {isLoadingImages ? (
                      <div className="flex flex-col items-center justify-center h-48 space-y-4">
                        <div className="animate-spin h-8 w-8 border-4 border-[#0083BF] border-t-transparent rounded-full" />
                        <p className="text-sm">Loading preview...</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {images.map((image, index) => (
                          <div key={index}>
                            <div className="rounded border border-[#0000001A] overflow-hidden">
                              <img
                                src={image.data || "/placeholder.svg"}
                                alt={originalFilename}
                                className="w-full h-56 object-contain bg-gray-50"
                              />
                            </div>
                            <div className="p-2 flex flex-row items-center justify-between">
                              <p className="text-sm font-medium">
                                Name: {originalFilename}
                              </p>
                              <p className="text-xs text-[#0083BF]">
                                Size: {(image.size / 1024).toFixed(2)} KB
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-2 flex items-center justify-center border-t border-[#0000001A] ">
                    <p className="text-sm font-medium text-gray-600">1 / 1</p>
                  </CardFooter>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Markdown Report Section */}
        {markdownReport && (
          <div className="w-full mt-6">
            <Card className="bg-white border border-[#0000001A]">
              <CardContent className="p-6 max-h-[calc(100vh-24rem)] overflow-y-auto">
                <MarkdownContent markdownContent={markdownReport} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
