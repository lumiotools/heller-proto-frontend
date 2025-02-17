"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, Square, RotateCcw, Play, Send } from "lucide-react";

const DEEPGRAM_API_KEY = "b101a134c90784b873eb62c3671012ae74013c9d";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Message {
  text: string;
  isAI: boolean;
}

interface QAPair {
  question: string;
  answer: string;
}

interface AnalyzeResponse {
  found_question?: string;
  found_answer?: string;
  next_question?: string;
  completed: boolean;
  previous_qa: QAPair[];
}

export default function AudioChat() {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hi Hope you're well. Let's get started", isAI: true },
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [previousQA, setPreviousQA] = useState<QAPair[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const webSocketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
        },
      });

      streamRef.current = stream;

      const socket = new WebSocket(
        "wss://api.deepgram.com/v1/listen?encoding=linear16&sample_rate=16000",
        ["token", DEEPGRAM_API_KEY]
      );

      webSocketRef.current = socket;

      socket.onopen = () => {
        const audioContext = new AudioContext({
          sampleRate: 16000,
        });
        audioContextRef.current = audioContext;

        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(2048, 1, 1);
        processorRef.current = processor;

        source.connect(processor);
        processor.connect(audioContext.destination);

        processor.onaudioprocess = (e: AudioProcessingEvent) => {
          if (socket.readyState === WebSocket.OPEN && !isPaused) {
            const inputData = e.inputBuffer.getChannelData(0);
            const pcmData = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
              pcmData[i] = Math.min(1, inputData[i]) * 0x7fff;
            }
            socket.send(pcmData.buffer);
          }
        };
      };

      socket.onmessage = (event: MessageEvent) => {
        const data = JSON.parse(event.data);
        if (data.type === "Results") {
          const transcript = data.channel?.alternatives[0]?.transcript;
          if (transcript && transcript.trim()) {
            setCurrentTranscript((prev) => {
              const newTranscript = prev + " " + transcript;
              return newTranscript.trim();
            });
          }
        }
      };

      socket.onerror = (error: Event) => {
        console.error("WebSocket Error:", error);
      };

      socket.onclose = () => {
        console.log("WebSocket closed");
      };

      setIsRecording(true);
      setIsPaused(false);
    } catch (err) {
      console.error("Error starting recording:", err);
    }
  };

  const pauseRecording = () => {
    setIsPaused(true);
  };

  const resumeRecording = () => {
    setIsPaused(false);
  };

  const stopRecording = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (webSocketRef.current) {
      webSocketRef.current.close();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setIsRecording(false);
    setIsPaused(false);
  };

  const redoRecording = () => {
    stopRecording();
    setCurrentTranscript("");
  };

  const submitTranscript = async () => {
    if (currentTranscript.trim() && !isCompleted) {
      try {
        setIsLoading(true);
        const finalTranscript = currentTranscript.trim();

        setMessages((prev) => [
          ...prev,
          { text: finalTranscript, isAI: false },
        ]);

        const response = await fetch(
          `${API_BASE_URL}/data2/analyze-transcript`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              transcript: finalTranscript,
              previous_qa: previousQA,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data: AnalyzeResponse = await response.json();

        if (data.found_question && data.found_answer) {
          setMessages((prev) => [
            ...prev,
            {
              text: `Found an answer!\n\nQuestion: ${data.found_question}\nAnswer: ${data.found_answer}`,
              isAI: true,
            },
          ]);
          setPreviousQA(data.previous_qa);
        }

        if (data.next_question) {
          setMessages((prev) => [
            ...prev,
            {
              text: `Now, please tell me about:\n\n${data.next_question}`,
              isAI: true,
            },
          ]);
        } else if (!data.completed) {
          setMessages((prev) => [
            ...prev,
            {
              text: "I couldn't find an answer in that transcript. Please try answering any of the remaining questions.",
              isAI: true,
            },
          ]);
        }

        setIsCompleted(data.completed);
        if (data.completed) {
          setMessages((prev) => [
            ...prev,
            {
              text: "Great! All questions have been answered. Thank you for your participation!",
              isAI: true,
            },
          ]);
        }
      } catch (error) {
        console.error("Error submitting transcript:", error);
        setMessages((prev) => [
          ...prev,
          {
            text: "Sorry, there was an error analyzing your response. Please try again.",
            isAI: true,
          },
        ]);
      } finally {
        setIsLoading(false);
        setCurrentTranscript("");
        stopRecording();
      }
    }
  };

  useEffect(() => {
    return () => {
      if (processorRef.current) {
        processorRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (webSocketRef.current) {
        webSocketRef.current.close();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-3xl mx-auto p-4 bg-gray-50 overflow-y-auto">
      <div className="flex-1 space-y-4 overflow-y-auto">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.isAI ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`rounded-lg p-3 max-w-[80%] ${
                message.isAI
                  ? "bg-[#011A2E05] text-gray-800"
                  : "bg-[#011A2ECC] text-white"
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
        {currentTranscript && (
          <div className="flex justify-end">
            <div className="bg-[#011A2ECC] text-white rounded-lg p-3 max-w-[80%] opacity-70">
              {currentTranscript}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center space-x-4 p-4 border-t mt-4">
        {isCompleted ? (
          <div className="text-green-600 font-medium">
            All questions answered! Thank you for your participation.
          </div>
        ) : !isRecording ? (
          <button
            onClick={startRecording}
            className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            disabled={isLoading}
          >
            <Mic className="w-6 h-6" />
          </button>
        ) : (
          <>
            {!isPaused ? (
              <button
                onClick={pauseRecording}
                className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors disabled:bg-gray-400"
                disabled={isLoading}
              >
                <Square className="w-6 h-6" />
              </button>
            ) : (
              <button
                onClick={resumeRecording}
                className="p-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors disabled:bg-gray-400"
                disabled={isLoading}
              >
                <Play className="w-6 h-6" />
              </button>
            )}

            <button
              onClick={redoRecording}
              className="p-3 bg-yellow-600 text-white rounded-full hover:bg-yellow-700 transition-colors disabled:bg-gray-400"
              disabled={isLoading}
            >
              <RotateCcw className="w-6 h-6" />
            </button>

            <button
              onClick={submitTranscript}
              className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              disabled={isLoading || !currentTranscript.trim()}
            >
              <Send className="w-6 h-6" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
