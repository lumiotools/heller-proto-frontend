"use client";

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';

export default function UploadButton() {
    const [file, setFile] = useState<File | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setFile(event.target.files[0]);
            setMessage(null); // Clear any previous messages
        }
    };

    const handleSubmit = async () => {
        if (!file) {
            setMessage("Please select a file before submitting.");
            return;
        }

        setIsLoading(true); // Start loading indicator

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("http://localhost:8000/upload/", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                setMessage(`File uploaded successfully: ${result.file}`);
            } else {
                const error = await response.json();
                setMessage(`Error: ${error.message}`);
            }
        } catch (error) {
            if (error instanceof Error) {
                setMessage(`Error: ${error.message}`);
            } else {
                setMessage("An unknown error occured")
            }
            
        } finally {
            setIsLoading(false); // Stop loading indicator
        }
    };

    return (
        <div className="p-4">
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
                            isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
                        } text-white font-semibold rounded-lg transition-all duration-200`}
                        disabled={isLoading}
                    >
                        {isLoading ? "Submitting..." : "Analyse"}
                    </button>
                </div>
            )}
            {message && <p className="mt-4 text-sm">{message}</p>}
        </div>
    );
}
