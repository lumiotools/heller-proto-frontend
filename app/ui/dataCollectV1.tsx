"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Mic,
  RotateCcw,
  Play,
  Send,
  CheckCircle2,
  Upload,
  Pause,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function RecordingPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [transcript, setTranscript] = useState<string>("");
  const [summary, setSummary] = useState("");
  const [showTranscript, setShowTranscript] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/mp4",
        });
        setRecordedAudio(audioBlob);

        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
        }

        const newAudioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(newAudioUrl);

        if (audioRef.current) {
          audioRef.current.src = newAudioUrl;
          audioRef.current.load();
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      setIsFinished(false);
    } catch (error: unknown) {
      console.error("Microphone access error:", error);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  };

  const finishRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      setIsRecording(false);
      setIsPaused(false);
      setIsFinished(true);
    }
  };

  const resetRecording = () => {
    setRecordedAudio(null);
    setTranscript("");
    setIsFinished(false);

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl("");
    }

    if (audioRef.current) {
      audioRef.current.src = "";
      audioRef.current.load();
    }
  };

  const sendRecording = async () => {
    if (!recordedAudio) return;

    const formData = new FormData();
    formData.append("file", recordedAudio, "audio.mp4");

    try {
      const response = await fetch(`${API_URL}/data/transcribe/`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.status === "success") {
        setTranscript(data.data.transcript);
        setSummary(data.data.summary);
      } else {
        throw new Error("Transcription failed");
      }
    } catch (error: unknown) {
      console.error("Transcription error:", error);
      alert("Failed to transcribe audio. Please try again.");
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setRecordedAudio(file);
      const newAudioUrl = URL.createObjectURL(file);
      setAudioUrl(newAudioUrl);
      setIsFinished(true);

      if (audioRef.current) {
        audioRef.current.src = newAudioUrl;
        audioRef.current.load();
      }
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-[#011A2E05] p-4 md:p-8">
      <Card className="max-w-3xl mx-auto bg-white shadow-lg">
        <CardContent className="p-8">
          <div className="space-y-8">
            {!transcript && (
              <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold text-[#011A2ECC]">
                  Share Your Knowledge
                </h1>
                <p className="text-xl text-gray-600">
                  Record or upload your voice message below
                </p>
              </div>
            )}

            <div className="flex flex-col items-center space-y-6">
              {isFinished && recordedAudio && (
                <div className="w-full max-w-md">
                  <audio
                    ref={audioRef}
                    controls
                    className="w-full mb-4"
                    src={audioUrl}
                  />
                </div>
              )}

              <div className="flex items-center justify-center space-x-6">
                {!isFinished ? (
                  <>
                    <Button
                      onClick={
                        isRecording
                          ? isPaused
                            ? resumeRecording
                            : pauseRecording
                          : startRecording
                      }
                      variant="outline"
                      size="lg"
                      className={`w-24 h-24 rounded-full border-2 flex flex-col items-center justify-center transition-colors ${
                        isRecording
                          ? isPaused
                            ? "border-yellow-500 text-yellow-500 hover:bg-yellow-50"
                            : "border-red-500 text-red-500 hover:bg-red-50"
                          : "border-[#011A2ECC] text-[#011A2ECC] hover:bg-[#011A2E10]"
                      }`}
                    >
                      {isRecording ? (
                        isPaused ? (
                          <>
                            <Play className="h-8 w-8" />
                            <span className="text-xs mt-1">Resume</span>
                          </>
                        ) : (
                          <>
                            <Pause className="h-8 w-8" />
                            <span className="text-xs mt-1">Pause</span>
                          </>
                        )
                      ) : (
                        <>
                          <Mic className="h-8 w-8" />
                          <span className="text-xs mt-1">Record</span>
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={triggerFileUpload}
                      variant="outline"
                      size="lg"
                      className="w-24 h-24 rounded-full border-2 border-[#011A2ECC] text-[#011A2ECC] hover:bg-[#011A2E10] flex flex-col items-center justify-center"
                    >
                      <Upload className="h-8 w-8" />
                      <span className="text-xs mt-1">Upload</span>
                    </Button>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="audio/*"
                      className="hidden"
                    />

                    {isRecording && (
                      <Button
                        onClick={finishRecording}
                        variant="outline"
                        size="lg"
                        className="w-24 h-24 rounded-full border-2 border-green-500 text-green-500 hover:bg-green-50 flex flex-col items-center justify-center"
                      >
                        <CheckCircle2 className="h-8 w-8" />
                        <span className="text-xs mt-1">Finish</span>
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <Button
                      onClick={resetRecording}
                      variant="outline"
                      size="lg"
                      className="w-24 h-24 rounded-full border-2 border-red-500 text-red-500 hover:bg-red-50 flex flex-col items-center justify-center"
                    >
                      <RotateCcw className="h-8 w-8" />
                      <span className="text-xs mt-1">Redo</span>
                    </Button>
                    <Button
                      onClick={sendRecording}
                      variant="outline"
                      size="lg"
                      className="w-24 h-24 rounded-full border-2 border-[#011A2ECC] text-[#011A2ECC] hover:bg-[#011A2E10] flex flex-col items-center justify-center"
                    >
                      <Send className="h-8 w-8" />
                      <span className="text-xs mt-1">Send</span>
                    </Button>
                  </>
                )}
              </div>

              {isRecording && !isFinished && (
                <p className="text-lg text-[#011A2ECC] font-medium">
                  {isPaused
                    ? "Recording paused. Click 'Resume' to continue."
                    : "Recording in progress. Click 'Pause' to pause or 'Finish' when done."}
                </p>
              )}

              {isFinished && !transcript && (
                <p className="text-lg text-[#011A2ECC] font-medium">
                  Your recording is ready! Listen above, then click
                  &apos;Send&apos; to transcribe or &apos;Redo&apos; if needed.
                </p>
              )}

              {(transcript || summary) && (
                <div className="w-full space-y-4">
                  <div className="flex items-center justify-end space-x-2">
                    <Label
                      htmlFor="show-transcript"
                      className="text-lg text-[#011A2ECC]"
                    >
                      Show Full Transcript
                    </Label>
                    <Switch
                      id="show-transcript"
                      checked={showTranscript}
                      onCheckedChange={setShowTranscript}
                    />
                  </div>

                  <div className="p-6 bg-[#011A2E10] rounded-lg shadow-sm">
                    <h2 className="text-2xl font-semibold text-[#011A2ECC] mb-4">
                      {showTranscript ? "Full Transcript" : "Summary"}
                    </h2>
                    <p className="text-lg leading-relaxed text-[#011A2ECC]">
                      {showTranscript ? transcript : summary}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
