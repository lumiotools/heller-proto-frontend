"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Mic,
  Square,
  RotateCcw,
  Play,
  Send,
  CheckCircle2,
  Upload,
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

        // Revoke the previous URL to avoid memory leaks
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

    // Clean up audio URL
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 p-4 md:p-8">
      <Card className="max-w-3xl mx-auto bg-white shadow-lg">
        <CardContent className="p-8">
          <div className="space-y-8">
            {!transcript && (
              <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold text-purple-800">
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
                      variant={isRecording ? "destructive" : "default"}
                      size="lg"
                      className="w-20 h-20 rounded-full bg-purple-600 hover:bg-purple-700"
                    >
                      {isRecording ? (
                        isPaused ? (
                          <Play className="h-8 w-8 text-white" />
                        ) : (
                          <Square className="h-8 w-8 text-white" />
                        )
                      ) : (
                        <Mic className="h-8 w-8 text-white" />
                      )}
                    </Button>

                    <Button
                      onClick={triggerFileUpload}
                      variant="outline"
                      size="lg"
                      className="w-20 h-20 rounded-full border-2 border-purple-600"
                    >
                      <Upload className="h-8 w-8 text-purple-600" />
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
                        variant="default"
                        size="lg"
                        className="w-20 h-20 rounded-full bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="h-8 w-8 text-white" />
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <Button
                      onClick={resetRecording}
                      variant="outline"
                      size="lg"
                      className="w-20 h-20 rounded-full border-2 border-red-600"
                    >
                      <RotateCcw className="h-8 w-8 text-red-600" />
                    </Button>
                    <Button
                      onClick={sendRecording}
                      variant="default"
                      size="lg"
                      className="w-20 h-20 rounded-full bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="h-8 w-8 text-white" />
                    </Button>
                  </>
                )}
              </div>

              {isRecording && !isFinished && (
                <p className="text-xl text-purple-600 font-medium">
                  {isPaused
                    ? "Recording paused. Click to resume."
                    : "Recording... Click square to pause or checkmark to finish."}
                </p>
              )}

              {isFinished && !transcript && (
                <p className="text-xl text-purple-600 font-medium">
                  Listen to your recording above, then send or redo if needed.
                </p>
              )}

              {(transcript || summary) && (
                <div className="w-full space-y-4">
                  <div className="flex items-center justify-end space-x-2">
                    <Label
                      htmlFor="show-transcript"
                      className="text-lg text-gray-700"
                    >
                      Show Transcript
                    </Label>
                    <Switch
                      id="show-transcript"
                      checked={showTranscript}
                      onCheckedChange={setShowTranscript}
                    />
                  </div>

                  <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg shadow-sm">
                    <h2 className="text-2xl font-semibold text-purple-800 mb-4">
                      {showTranscript ? "Transcript" : "Summary"}
                    </h2>
                    <p className="text-xl leading-relaxed text-gray-700">
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
