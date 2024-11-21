import { RealtimeClient } from "../../lib/client";
import { RealtimeUtils } from "../../lib/utils";

class RealtimeService {
  constructor() {
    this.client = null;
    this.eventHandlers = new Map();
    this.audioContext = null;
    this.mediaStream = null;
    this.processor = null;
    this.isConnected = false;

    // Session configuration moved to a static property
    this.sessionConfig = {
      modalities: ["text", "audio"],
      voice: "shimmer",
      input_audio_format: "pcm16",
      output_audio_format: "pcm16",
      turn_detection: {
        type: "server_vad",
        threshold: 0.5,
        prefix_padding_ms: 300,
        silence_duration_ms: 200,
      },
      instructions:
        "You are AIda, a helpful and friendly AI assistant with a warm, engaging personality. Be concise but natural in your responses.",
      tool_choice: "auto",
      temperature: 0.8,
      max_response_output_tokens: 4096,
      tools: [],
    };
  }

  async initialize(apiKey) {
    try {
      // Initialize the client with the model
      this.client = new RealtimeClient({
        apiKey,
        debug: true,
        dangerouslyAllowAPIKeyInBrowser: true,
      });

      // Connect with model specification
      await this.client.connect({
        model: "gpt-4o-realtime-preview-2024-10-01",
      });

      // Single session update with complete configuration
      await this.client.updateSession(this.sessionConfig);

      this.setupEventListeners();
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error("Failed to initialize realtime service:", error);
      this.isConnected = false;
      throw error;
    }
  }

  setupEventListeners() {
    if (!this.client) return;

    this.client.on("server.input_audio_buffer.speech_started", (event) => {
      console.log("Speech detected", event);
      this.emit("speechStarted", event);
    });

    this.client.on("server.input_audio_buffer.speech_stopped", (event) => {
      console.log("Speech stopped", event);
      this.emit("speechStopped", event);

      // Automatically generate response when speech ends
      if (this.client) {
        try {
          this.client.createResponse();
        } catch (error) {
          console.error("Error creating response:", error);
        }
      }
    });

    // Improved audio response handling
    this.client.on("server.response.audio.delta", (event) => {
      if (event.delta) {
        try {
          const arrayBuffer = RealtimeUtils.base64ToArrayBuffer(event.delta);
          const audioData = new Int16Array(arrayBuffer);

          console.log("Received audio chunk:", {
            size: audioData.length,
            duration: (audioData.length / 24000) * 1000 + "ms",
            firstFewSamples: Array.from(audioData.slice(0, 5)),
          });

          this.emit("audioResponse", { delta: audioData });
        } catch (error) {
          console.error("Error processing audio delta:", error);
        }
      }
    });

    this.client.on("server.response.text.delta", (event) => {
      this.emit("textResponse", event);
    });

    this.client.on("server.error", (event) => {
      console.error("Server error:", event);
      this.emit("error", event);
    });

    // Handle conversation updates
    this.client.on("server.conversation.item.created", (event) => {
      console.log("New conversation item:", event);
      this.emit("conversationUpdated", event);
    });

    // Handle rate limits
    this.client.on("server.rate_limits.updated", (event) => {
      console.log("Rate limits updated:", event.rate_limits);
    });
  }

  async startRecording() {
    if (!this.client || !this.isConnected) {
      throw new Error("Realtime service not initialized");
    }

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 24000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      this.audioContext = new AudioContext({
        sampleRate: 24000,
        latencyHint: "interactive",
      });

      const source = this.audioContext.createMediaStreamSource(
        this.mediaStream
      );
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

      source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);

      // Fixed audio processing handler
      this.processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const audioData = this.convertFloat32ToInt16(inputData);

        if (this.client) {
          try {
            this.client.appendInputAudio(audioData);
          } catch (error) {
            console.error("Error sending audio:", error);
          }
        }
      };

      // Create initial response stream
      await this.client.createResponse();

      return true;
    } catch (error) {
      console.error("Error starting recording:", error);
      await this.stopRecording();
      throw error;
    }
  }

  convertFloat32ToInt16(float32Array) {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return int16Array;
  }

  async stopRecording() {
    try {
      if (this.processor) {
        this.processor.disconnect();
        this.processor = null;
      }

      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach((track) => track.stop());
        this.mediaStream = null;
      }

      if (this.audioContext) {
        await this.audioContext.close();
        this.audioContext = null;
      }

      if (this.client) {
        await this.client.createResponse({ type: "response.cancel" });
      }
    } catch (error) {
      console.error("Error stopping recording:", error);
      throw error;
    }
  }

  addListener(eventName, callback) {
    if (!this.eventHandlers.has(eventName)) {
      this.eventHandlers.set(eventName, new Set());
    }
    this.eventHandlers.get(eventName).add(callback);
  }

  removeListener(eventName, callback) {
    const handlers = this.eventHandlers.get(eventName);
    if (handlers) {
      handlers.delete(callback);
    }
  }

  emit(eventName, data) {
    const handlers = this.eventHandlers.get(eventName);
    if (handlers) {
      handlers.forEach((handler) => handler(data));
    }
  }

  async disconnect() {
    await this.stopRecording();

    if (this.client) {
      this.client.disconnect();
      this.client = null;
    }

    this.isConnected = false;
  }
}

export default new RealtimeService();
