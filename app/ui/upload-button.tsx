"use client";

import React, { JSX, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import MarkdownPage from "./read-markdown";

interface APIResponse {
  markdown_report: string;
  detail?: string;
}

export default function CADUploadButton(): JSX.Element {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [markdownReport, setMarkdownReport] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const fileType = selectedFile.name.toLowerCase().split(".").pop();

      // Validate file type
      if (!["step", "stp", "dxf", "zip"].includes(fileType || "")) {
        setMessage("Please upload only STEP, DXF, or ZIP files.");
        return;
      }

      setFile(selectedFile);
      setMessage(null);
      setMarkdownReport(null);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setMessage("Please select a file before submitting.");
      return;
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
    <div className="p-4 max-w-4xl mx-auto">
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
            accept=".step,.stp,.dxf,.zip"
            className="hidden"
          />
          <p className="mt-2 text-xs text-gray-500">
            Supported formats: STEP (.step, .stp), DXF (.dxf), ZIP (.zip)
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
              Analyzing CAD File...
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

      {/* Analysis Results Section */}
      {markdownReport && (
        <div className="mt-8">
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">CAD Analysis Report</h2>
            <div className="bg-white p-6 rounded-lg shadow-lg prose max-w-none">
              <MarkdownPage markdown={markdownReport} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
