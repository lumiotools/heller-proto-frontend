"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Square, RotateCcw, Play, Send, CheckCircle2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function RecordingPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [transcript, setTranscript] = useState<string>("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

      if (data.success) {
        setTranscript(data.transcript);
      } else {
        throw new Error("Transcription failed");
      }
    } catch (error: unknown) {
      console.error("Transcription error:", error);
      alert("Failed to transcribe audio. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="space-y-6">
            {!transcript && (
              <h1 className="text-2xl font-semibold text-center text-gray-800">
                Hi, what knowledge would you like to contribute today?
              </h1>
            )}

            <div className="flex flex-col items-center space-y-4">
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

              <div className="flex items-center space-x-4">
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
                      className="w-16 h-16 rounded-full"
                    >
                      {isRecording ? (
                        isPaused ? (
                          <Play className="h-6 w-6" />
                        ) : (
                          <Square className="h-6 w-6" />
                        )
                      ) : (
                        <Mic className="h-6 w-6" />
                      )}
                    </Button>
                    {isRecording && (
                      <Button
                        onClick={finishRecording}
                        variant="default"
                        size="lg"
                        className="w-16 h-16 rounded-full"
                      >
                        <CheckCircle2 className="h-6 w-6" />
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <Button
                      onClick={resetRecording}
                      variant="outline"
                      size="lg"
                      className="w-16 h-16 rounded-full"
                    >
                      <RotateCcw className="h-6 w-6" />
                    </Button>
                    <Button
                      onClick={sendRecording}
                      variant="default"
                      size="lg"
                      className="w-16 h-16 rounded-full"
                    >
                      <Send className="h-6 w-6" />
                    </Button>
                  </>
                )}
              </div>

              {isRecording && !isFinished && (
                <p className="text-sm text-gray-500">
                  {isPaused
                    ? "Recording paused. Click to resume."
                    : "Recording... Click square to pause or checkmark to finish."}
                </p>
              )}

              {isFinished && !transcript && (
                <p className="text-sm text-gray-500">
                  Listen to your recording above, then send or redo if needed.
                </p>
              )}

              {transcript && (
                <div className="w-full p-4 bg-white rounded-lg shadow-sm">
                  <p className="text-gray-700">{transcript}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
