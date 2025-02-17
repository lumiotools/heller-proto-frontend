/* eslint-disable @typescript-eslint/no-unused-vars */
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
      fileInputRef.current.value = "";
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
      className={`w-full font-montserrat antialiased ${
        images.length > 0 || isLoadingImages || markdownReport
          ? "min-h-[calc(100vh-4rem)] bg-[#F8FAFC]"
          : "h-[calc(100vh-4rem)] bg-[#F8FAFC] flex items-center justify-center"
      } overflow-y-auto`}
    >
      <div
        className={`container ${
          images.length > 0 || isLoadingImages || markdownReport
            ? "py-16 px-4"
            : "px-4"
        }`}
      >
        <div
          className={`mx-auto transition-all duration-300 ease-in-out ${
            images.length > 0 || isLoadingImages || markdownReport
              ? "w-full max-w-7xl"
              : "w-full max-w-xl"
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
                  <CardTitle className="text-[24px] leading-8 font-semibold text-black-900 text-center">
                    CAD File Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-4">
                    <label
                      htmlFor="file-upload"
                      className={`group relative flex flex-col items-center justify-center w-full ${
                        totalTime !== null ||
                        images.length > 0 ||
                        isLoadingImages
                          ? "h-32"
                          : "h-64"
                      } border border-[#0083BF3D] rounded-lg bg-[#0083BF0A] hover:bg-blue-50 transition-all duration-300 cursor-pointer`}
                    >
                      <div className="space-y-2 text-center">
                        {/* <Upload className="mx-auto h-12 w-12 text-[#0083BF]" /> */}
                        <svg
                          width="56"
                          height="69"
                          viewBox="0 0 56 69"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="mx-auto h-12 w-12"
                        >
                          <path
                            d="M5.5 24.8488V21.7997C5.5 20.991 6.02678 20.2154 6.96447 19.6436C7.90215 19.0718 9.17392 18.7505 10.5 18.7505H15.5M40.5 18.7505H45.5C46.8261 18.7505 48.0979 19.0718 49.0355 19.6436C49.9732 20.2154 50.5 20.991 50.5 21.7997V24.8488"
                            stroke="#4C829B"
                            stroke-width="1.30182"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                          <path
                            d="M5.74707 58.3621V62.4568C5.74707 63.5429 6.27385 64.5844 7.21154 65.3523C8.14922 66.1202 9.42099 66.5516 10.7471 66.5516H15.7471M40.7471 66.5516H45.7471C47.0732 66.5516 48.3449 66.1202 49.2826 65.3523C50.2203 64.5844 50.7471 63.5429 50.7471 62.4568V58.3621"
                            stroke="#4C829B"
                            stroke-width="1.30182"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                          <path
                            d="M28.2446 44.4846L48.7477 33.3016V56.8852L28.2446 68.7112V44.4846Z"
                            fill="#011A2E"
                            fill-opacity="0.61"
                          />
                          <path
                            d="M28.2446 44.4846L7.74396 33.3016V56.8852L28.2471 68.7112L28.2446 44.4846Z"
                            fill="#011A2E"
                            fill-opacity="0.8"
                          />
                          <path
                            d="M28.2446 22.1211L48.7451 33.3016L28.2446 44.4847L7.74396 33.3016L28.2446 22.1211Z"
                            fill="#F2F2F2"
                          />
                          <path
                            d="M28.2446 22.1211L48.7452 33.3016L28.2446 44.4847V22.1211Z"
                            fill="#D2DCE9"
                          />
                          <path
                            d="M28.2446 44.4846L48.7477 33.3016L55.6353 37.025L35.6991 48.5169L28.2446 44.4846ZM28.2446 44.4846L7.74401 33.3016L0.853943 37.025L20.7901 48.5169L28.2446 44.4846Z"
                            fill="#71B6D6"
                          />
                          <path
                            d="M28.2294 22.1413L7.73134 33.3218L0.838745 29.6009L20.7749 18.109L28.2294 22.1413ZM28.2446 22.116L48.7477 33.2991L55.6352 29.5781L35.6991 18.0862L28.2446 22.116Z"
                            fill="#0083BF"
                            fill-opacity="0.39"
                          />
                          <path
                            d="M38 15.5L28 5.5L18 15.5"
                            stroke="url(#paint0_linear_1_309)"
                            stroke-width="3.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                          <path
                            d="M28 9.52341V29.5"
                            stroke="url(#paint1_linear_1_309)"
                            stroke-width="3.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                          <defs>
                            <linearGradient
                              id="paint0_linear_1_309"
                              x1="28"
                              y1="5.5"
                              x2="28"
                              y2="15.5"
                              gradientUnits="userSpaceOnUse"
                            >
                              <stop stop-color="#324758" />
                              <stop offset="1" stop-color="#011A2E" />
                            </linearGradient>
                            <linearGradient
                              id="paint1_linear_1_309"
                              x1="28.5"
                              y1="9.52341"
                              x2="28.5"
                              y2="29.5"
                              gradientUnits="userSpaceOnUse"
                            >
                              <stop stop-color="#283D4F" />
                              <stop offset="1" stop-color="#011A2E" />
                            </linearGradient>
                          </defs>
                        </svg>

                        <div className="text-[16px] leading-6 text-black-900">
                          <span className="font-semibold">Click to upload</span>{" "}
                          or drag and drop
                        </div>
                        <p className="text-[14px] leading-5 text-[#0083BF]">
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
                          <p className="text-[14px] leading-5 font-medium text-[#011A2E]">
                            Selected: {file.name}
                          </p>
                          <p className="text-[14px] leading-5 text-[#0083BF]">
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
                      className="w-full h-12 bg-[#0083BF] hover:bg-[#0083BF]/90 text-white text-[16px] leading-6 font-semibold rounded"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                          <span>Analyzing... ({formatTime(timer)})</span>
                        </div>
                      ) : (
                        "Analyse CAD File"
                      )}
                    </Button>

                    {message && (
                      <Alert variant="destructive">
                        <AlertTitle className="text-[16px] leading-6 font-semibold">
                          Error
                        </AlertTitle>
                        <AlertDescription className="text-[14px] leading-5">
                          {message}
                        </AlertDescription>
                      </Alert>
                    )}
                    {totalTime !== null && (
                      <Alert className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                        <Clock className="h-4 w-4 text-[#0083BF]" />
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] leading-5 font-medium text-[#011A2E]">
                            Analysis Complete
                          </span>
                          <span className="text-[14px] leading-5 text-[#0083BF]">
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
                    <CardTitle className="text-[20px] leading-7 text-black-900 flex items-center gap-2">
                      <Image className="h-5 w-5" />
                      Images
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col justify-between space-y-4">
                    {isLoadingImages ? (
                      <div className="flex flex-col items-center justify-center h-48 space-y-4">
                        <div className="animate-spin h-8 w-8 border-4 border-[#0083BF] border-t-transparent rounded-full" />
                        <p className="text-[14px] leading-5">
                          Loading preview...
                        </p>
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
                              <p className="text-[14px] leading-5 font-medium">
                                Name: {originalFilename}
                              </p>
                              <p className="text-[12px] leading-4 text-[#0083BF]">
                                Size: {(image.size / 1024).toFixed(2)} KB
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-2 flex items-center justify-center border-t border-[#0000001A]">
                    <p className="text-[14px] leading-5 font-medium text-gray-600">
                      1 / 1
                    </p>
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
