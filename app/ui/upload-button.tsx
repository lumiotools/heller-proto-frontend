"use client";

import React, { JSX, useState, useEffect } from "react";
import { Upload, Clock, Image } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// import { Progress } from "@/components/ui/progress";
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
}

export default function CADUploadButton(): JSX.Element {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [markdownReport, setMarkdownReport] = useState<string | null>(null);
  const [timer, setTimer] = useState<number>(0);
  const [totalTime, setTotalTime] = useState<number | null>(null);
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState<boolean>(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setTimer(0);
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    } else {
      if (timer > 0) {
        setTotalTime(timer);
      }
      setTimer(0);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isLoading]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const fileType = selectedFile.name.toLowerCase().split(".").pop();
      if (!["step", "stp", "dxf", "zip", "fcstd"].includes(fileType || "")) {
        setMessage("Please upload only STEP, DXF, FCStd, or ZIP files.");
        return;
      }
      setFile(selectedFile);
      setMessage(null);
      setMarkdownReport(null);
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
    const fileExt = file.name.toLowerCase().split(".").pop();
    if (fileExt === "zip" || fileExt === "fcstd") {
      await extractImages(file);
    }
    setIsLoading(true);
    setMarkdownReport(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
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
      if (error instanceof Error) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage("An unknown error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="h-full w-full overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6 p-6">
          <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
            <CardHeader>
              <CardTitle className="text-2xl text-blue-900">
                CAD File Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <label
                  htmlFor="file-upload"
                  className="group relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50/50 hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <div className="space-y-2 text-center">
                    <Upload className="mx-auto h-8 w-8 text-blue-500" />
                    <div className="text-sm text-blue-900">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </div>
                    <p className="text-xs text-blue-600">
                      STEP (.step, .stp), FreeCAD ZIP (.zip, .FCStd)
                    </p>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    onChange={handleFileChange}
                    accept=".step,.stp,.dxf,.zip,.FCStd"
                    className="hidden"
                  />
                </label>

                {file && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-900 font-medium">
                      Selected: {file.name}
                    </p>
                    <p className="text-xs text-blue-700">
                      Size: {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      <span>Analyzing... ({formatTime(timer)})</span>
                    </div>
                  ) : (
                    "Analyze CAD File"
                  )}
                </Button>

                {message && (
                  <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{message}</AlertDescription>
                  </Alert>
                )}
              </div>

              {totalTime !== null && (
                <Alert className="bg-blue-50 border-blue-200">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-900">
                    Analysis Complete
                  </AlertTitle>
                  <AlertDescription className="text-blue-700">
                    Processed in {formatTime(totalTime)}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {(images.length > 0 || isLoadingImages) && (
            <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
              <CardHeader>
                <CardTitle className="text-xl text-blue-900 flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Generated Images
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingImages ? (
                  <div className="flex flex-col items-center justify-center p-12 space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600" />
                    <p className="text-blue-900 text-sm">
                      Extracting images...
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {images.map((image, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-lg shadow-sm border border-blue-100 overflow-hidden"
                      >
                        <img
                          src={image.data}
                          alt={image.filename}
                          className="w-full h-64 object-contain bg-gray-50"
                        />
                        <div className="p-4">
                          <p className="text-sm font-medium text-blue-900">
                            {image.filename}
                          </p>
                          <p className="text-xs text-blue-600">
                            Size: {(image.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {markdownReport && (
            <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
              <CardContent className="p-6">
                <MarkdownContent markdownContent={markdownReport} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
