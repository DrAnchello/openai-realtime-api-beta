import React, { useState, useEffect, useRef } from "react";
import GlassCard from "../ui/GlassCard";
import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import AudioVisualizer from "./AudioVisualizer";
import AudioPlayer from "../AudioPlayer";
import ChatInputControls from "../ui/ChatInputControls";
import { motion, AnimatePresence } from "framer-motion";
import useConversationStore from "../../stores/conversationStore";
import realtimeService from "../../services/ai/realtimeService";
import { aidaBrain } from "../../services/ai/aidaBrain";

const ChatInterface = ({ userName }) => {
  const {
    messages,
    isRecording,
    isConnected,
    audioData,
    sendMessage,
    setRecording,
    setConnected,
    setAudioData,
    addMessage,
  } = useConversationStore();

  const [isMobile, setIsMobile] = useState(false);
  const [error, setError] = useState(null);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const audioPlayerRef = useRef(null);
  const messageCountRef = useRef(0);

  // Initialize conversation
  useEffect(() => {
    const initializeConversation = async () => {
      try {
        if (!currentConversationId) {
          const conversationId = await aidaBrain.startConversation(userName);
          setCurrentConversationId(conversationId);
          console.log("Started new conversation:", conversationId);
        }
      } catch (error) {
        console.error("Error initializing conversation:", error);
        setError("Failed to start conversation");
      }
    };

    initializeConversation();
  }, [userName]);

  // Track message count and trigger processing
  useEffect(() => {
    messageCountRef.current = messages.length;

    const processIfNeeded = async () => {
      if (currentConversationId && messages.length >= 50) {
        try {
          await aidaBrain.processConversation(currentConversationId);
        } catch (error) {
          console.error("Error processing conversation:", error);
        }
      }
    };

    processIfNeeded();
  }, [messages.length, currentConversationId]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleAudioResponse = (event) => {
      if (event.delta && audioPlayerRef.current) {
        console.log("Received audio data:", {
          size: event.delta.length,
          sampleRate: 24000,
          duration: (event.delta.length / 24000) * 1000 + "ms",
        });

        audioPlayerRef.current.addToQueue(event.delta);
      }
    };

    const handleTextResponse = async (event) => {
      const { delta } = event;
      if (delta?.text && currentConversationId) {
        const message = {
          role: "assistant",
          text: delta.text,
          timestamp: Date.now(),
        };

        addMessage(message);

        // Store in AidaBrain
        try {
          await aidaBrain.addMessage(currentConversationId, "assistant", {
            content: delta.text,
            timestamp: Date.now(),
          });
        } catch (error) {
          console.error("Error storing message:", error);
        }
      }
    };

    const handleSpeechStarted = async () => {
      console.log("Speech detected, processing...");
      if (currentConversationId) {
        const message = {
          role: "user",
          text: "...",
          timestamp: Date.now(),
          isProcessing: true,
        };

        addMessage(message);
      }
    };

    const handleSpeechStopped = async (event) => {
      console.log("Speech stopped, transcript:", event.transcript);
      if (event.transcript && currentConversationId) {
        const messages = [...useConversationStore.getState().messages];
        const lastIndex = messages.findIndex((m) => m.isProcessing);

        if (lastIndex !== -1) {
          const updatedMessage = {
            ...messages[lastIndex],
            text: event.transcript,
            isProcessing: false,
          };

          messages[lastIndex] = updatedMessage;
          useConversationStore.setState({ messages });

          // Store in AidaBrain
          try {
            await aidaBrain.addMessage(currentConversationId, "user", {
              content: event.transcript,
              timestamp: Date.now(),
            });
          } catch (error) {
            console.error("Error storing transcript:", error);
          }
        }
      }
    };

    realtimeService.addListener("audioResponse", handleAudioResponse);
    realtimeService.addListener("textResponse", handleTextResponse);
    realtimeService.addListener("speechStarted", handleSpeechStarted);
    realtimeService.addListener("speechStopped", handleSpeechStopped);

    return () => {
      realtimeService.removeListener("audioResponse", handleAudioResponse);
      realtimeService.removeListener("textResponse", handleTextResponse);
      realtimeService.removeListener("speechStarted", handleSpeechStarted);
      realtimeService.removeListener("speechStopped", handleSpeechStopped);
    };
  }, [addMessage, currentConversationId]);

  const handleStartRecording = async () => {
    try {
      const success = await realtimeService.startRecording((e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const audioData = new Float32Array(inputData);
        setAudioData(audioData);
      });

      if (success) {
        setRecording(true);
        setError(null);
      }
    } catch (error) {
      console.error("Error starting recording:", error);
      setError(error.message || "Failed to start recording");
      setRecording(false);
    }
  };

  const handleStopRecording = async () => {
    try {
      await realtimeService.stopRecording();
      setRecording(false);
      setAudioData(null);
    } catch (error) {
      console.error("Error stopping recording:", error);
      setError(error.message || "Failed to stop recording");
    }
  };

  const handleSendMessage = async (text) => {
    if (!currentConversationId) {
      setError("No active conversation");
      return;
    }

    try {
      await sendMessage(text);

      // Store in AidaBrain
      await aidaBrain.addMessage(currentConversationId, "user", {
        content: text,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("Error sending message:", error);
      setError(error.message || "Failed to send message");
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isRecording) {
        handleStopRecording();
      }
    };
  }, [isRecording]);

  return (
    <div className="p-8">
      <GlassCard className="p-6">
        <div
          className={`w-full mx-auto ${isMobile ? "max-w-full" : "max-w-8xl"}`}>
          <GlassCard
            style={{ background: "whitesmoke" }}
            className={`flex flex-col ${
              isMobile ? "rounded-none" : "h-full rounded-2xl"
            }`}>
            <ChatHeader isConnected={isConnected} userName={userName} />

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence>
                {messages.map((message, index) => (
                  <MessageBubble
                    key={`${message.timestamp}-${index}`}
                    message={message}
                    isAI={message.role === "assistant"}
                  />
                ))}
              </AnimatePresence>
            </div>

            {error && (
              <div className="p-2 mb-4 bg-red-50 text-red-500 rounded">
                {error}
              </div>
            )}

            <div>
              <AudioVisualizer
                audioData={audioData}
                isRecording={isRecording}
              />
              <ChatInputControls
                isRecording={isRecording}
                onStartRecording={handleStartRecording}
                onStopRecording={handleStopRecording}
                onSendMessage={handleSendMessage}
                isConnected={isConnected}
              />
            </div>

            <AudioPlayer
              ref={audioPlayerRef}
              onError={(error) => setError(error)}
            />
          </GlassCard>
        </div>
      </GlassCard>
    </div>
  );
};

export default ChatInterface;
