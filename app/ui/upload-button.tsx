"use client";

import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import MarkdownPage from "./read-markdown";

export default function UploadButton() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [markdownContent, setMarkdownContent] = useState<string | null>(null);

  const router = useRouter();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setMessage(null);
      setMarkdownContent(null); // Clear previous markdown content
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setMessage("Please select a file before submitting.");
      return;
    }

    setIsLoading(true);
    setMarkdownContent(null); // Clear previous content while loading

    const formData = new FormData();
    formData.append("dxf_file", file);

    try {
      const response = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setMarkdownContent(result.report);
        setMessage(null); // Clear any error messages
      } else {
        const error = await response.json();
        setMessage(`Error: ${error.message}`);
      }
    } catch (error) {
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
    <div className="p-4">
      <div className="mb-6">
        <label
          htmlFor="file-upload"
          className="flex items-center px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 cursor-pointer"
        >
          Upload New File to Analyse
          <FontAwesomeIcon icon={faUpload} className="ml-2" />
        </label>
        <input
          id="file-upload"
          type="file"
          onChange={handleFileChange}
          accept=".dwg,.dxf,.stp,.iges,.stl,.sldprt,.sldasm,.catpart,.prt,.ipt,.3dm,.dwf"
          className="hidden"
        />
        {file && (
          <div className="mt-4">
            <p className="text-sm text-gray-700">Selected File: {file.name}</p>
            <button
              type="button"
              onClick={handleSubmit}
              className={`mt-2 px-6 py-3 ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600"
              } text-white font-semibold rounded-lg transition-all duration-200`}
              disabled={isLoading}
            >
              {isLoading ? "Submitting..." : "Analyse"}
            </button>
          </div>
        )}
        {message && <p className="mt-4 text-sm text-red-500">{message}</p>}
      </div>

      {markdownContent && (
        <div className="mt-6 border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">Analysis Report</h2>
          <MarkdownPage markdown={markdownContent} />
        </div>
      )}
    </div>
  );
}
