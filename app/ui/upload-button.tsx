/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { JSX, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import MarkdownPage from "./read-markdown";
import { HTMLContent } from "./htmlParser";
import MarkdownContent from "./MarkdownContent";
import { faClock, faImage } from "@fortawesome/free-regular-svg-icons";

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

  // Timer effect
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

      // Validate file type
      if (!["step", "stp", "dxf", "zip", "fcstd"].includes(fileType || "")) {
        console.log("filetype", fileType);
        setMessage("Please upload only STEP, DXF,FCStd, or ZIP files.");
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
        console.log("success image", result);
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
        console.log("result", result);
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
    <div className="h-screen overflow-y-auto overflow-x-hidden">
      <div className="p-4 max-w-4xl mx-auto w-full">
        <div className="mb-6 space-y-6">
          {/* File Upload Section */}
          <div>
            <label
              htmlFor="file-upload"
              className="flex items-center px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 cursor-pointer w-fit"
            >
              Upload CAD File
              <FontAwesomeIcon icon={faUpload} className="ml-2" />
            </label>
            <input
              id="file-upload"
              type="file"
              onChange={handleFileChange}
              accept=".step,.stp,.dxf,.zip,.FCStd"
              className="hidden"
            />
            <p className="mt-2 text-xs text-gray-500">
              Supported formats: STEP (.step, .stp), FreeCAD ZIP (.zip,.FCStd)
            </p>
            {file && (
              <div className="mt-2">
                <p className="text-sm text-gray-700 font-medium">
                  Selected File: {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  Size: {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            className={`w-full px-6 py-3 ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            } text-white font-semibold rounded-lg transition-all duration-200`}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Analyzing CAD File... ({formatTime(timer)})
              </div>
            ) : (
              "Analyze CAD File"
            )}
          </button>

          {message && (
            <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">
              {message}
            </p>
          )}
        </div>
        {totalTime !== null && (
          <div className="mb-6 bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-center">
            <FontAwesomeIcon icon={faClock} className="text-blue-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Analysis completed in {formatTime(totalTime)}
              </p>
              <p className="text-xs text-blue-700">
                Total processing time for CAD analysis
              </p>
            </div>
          </div>
        )}
        {/* Images Section */}
        {/* Images Section */}
        {images.length > 0 && (
          <div className="mt-8 mb-8">
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FontAwesomeIcon icon={faImage} className="mr-2" />
                Images
              </h2>
              <div className="space-y-4">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className="bg-white p-6 rounded-lg shadow-lg"
                  >
                    <div className="flex flex-col items-center">
                      <img
                        src={image.data}
                        alt={image.filename}
                        className="max-w-full h-96 object-contain mb-4"
                      />
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-700">
                          {image.filename}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Size: {(image.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* Analysis Results Section */}
        {markdownReport && (
          <div className="mt-8">
            <div className="border-t pt-6">
              {/* <h2 className="text-xl font-semibold mb-4">CAD Analysis Report</h2> */}
              <div className="bg-white p-6 rounded-lg shadow-lg">
                {/* <MarkdownPage markdown={markdownReport} /> */}
                {/* <HTMLContent htmlContent={markdownReport} /> */}
                <MarkdownContent markdownContent={markdownReport} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
