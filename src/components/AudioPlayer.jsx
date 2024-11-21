import React, { useEffect, useRef, useState } from "react";

const AudioPlayer = React.forwardRef((props, ref) => {
  const audioContextRef = useRef(null);
  const audioQueueRef = useRef([]);
  const isPlayingRef = useRef(false);
  const gainNodeRef = useRef(null);

  const [isReady, setIsReady] = useState(false);
  const [audioDevices, setAudioDevices] = useState([]);

  // Expose methods via ref
  React.useImperativeHandle(ref, () => ({
    addToQueue: (audioData) => {
      if (!(audioData instanceof Int16Array)) {
        console.error("Invalid audio data format:", typeof audioData);
        return;
      }

      // Skip silent audio chunks
      if (!audioData.some((sample) => Math.abs(sample) > 0)) {
        console.log("Skipping silent audio chunk");
        return;
      }

      console.log("Adding audio chunk to queue:", {
        samples: audioData.length,
        durationMs: (audioData.length / 24000) * 1000,
        queueLength: audioQueueRef.current.length,
      });

      audioQueueRef.current.push(audioData);

      // Start playback if not already playing
      if (!isPlayingRef.current) {
        console.log("Starting playback");
        playNextInQueue();
      }
    },
    clearQueue: () => {
      console.log("Clearing audio queue");
      audioQueueRef.current = [];
    },
  }));

  useEffect(() => {
    const initializeAudio = async () => {
      try {
        // Get and log available audio devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const outputDevices = devices.filter(
          (device) => device.kind === "audiooutput"
        );
        setAudioDevices(outputDevices);
        console.log("Available audio output devices:", outputDevices);

        // Initialize AudioContext with logging
        audioContextRef.current = new AudioContext({ sampleRate: 24000 });
        console.log("AudioContext state:", audioContextRef.current.state);
        console.log(
          "AudioContext destination:",
          audioContextRef.current.destination
        );

        // Create and configure gain node
        gainNodeRef.current = audioContextRef.current.createGain();
        gainNodeRef.current.gain.value = 1.0; // Full volume
        gainNodeRef.current.connect(audioContextRef.current.destination);
        console.log("Gain node created and connected");

        setIsReady(true);
        console.log("Audio system initialized");

        // Log current audio settings
        console.log("Current audio configuration:", {
          sampleRate: audioContextRef.current.sampleRate,
          state: audioContextRef.current.state,
          baseLatency: audioContextRef.current.baseLatency,
          outputLatency: audioContextRef.current.outputLatency,
        });
      } catch (error) {
        console.error("Error initializing audio system:", error);
      }
    };

    initializeAudio();

    return () => {
      if (audioContextRef.current) {
        console.log("Cleaning up AudioContext");
        audioContextRef.current.close();
      }
    };
  }, []);

  const resumeAudioContext = async () => {
    if (audioContextRef.current?.state === "suspended") {
      await audioContextRef.current.resume();
      console.log("AudioContext resumed:", audioContextRef.current.state);
    }
  };

  // Add this to your component's useEffect
  useEffect(() => {
    // Add click handler to resume audio context
    const handleClick = () => {
      resumeAudioContext();
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const playNextInQueue = async () => {
    if (!isReady) {
      console.log("Audio system not ready");
      return;
    }

    if (isPlayingRef.current) {
      console.log("Already playing audio");
      return;
    }

    if (audioQueueRef.current.length === 0) {
      console.log("Audio queue empty");
      return;
    }

    console.log("Starting playback of next audio chunk");
    console.log("Queue length:", audioQueueRef.current.length);

    isPlayingRef.current = true;
    const audioData = audioQueueRef.current.shift();

    try {
      console.log("Creating audio buffer:", {
        channels: 1,
        length: audioData.length,
        sampleRate: 24000,
      });

      const audioBuffer = audioContextRef.current.createBuffer(
        1,
        audioData.length,
        24000
      );
      const channelData = audioBuffer.getChannelData(0);

      // Convert Int16 to Float32 with logging
      console.log("Converting audio data:", {
        sourceFormat: "Int16",
        targetFormat: "Float32",
        dataLength: audioData.length,
        firstFewSamples: Array.from(audioData.slice(0, 5)),
      });

      for (let i = 0; i < audioData.length; i++) {
        channelData[i] = audioData[i] / 0x8000;
      }

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(gainNodeRef.current);

      source.onended = () => {
        console.log("Audio chunk playback completed");
        isPlayingRef.current = false;
        playNextInQueue();
        if (audioQueueRef.current.length === 0) {
          console.log("Queue empty, notifying completion");
          props.onPlaybackComplete?.();
        }
      };

      // Resume context and start playback
      await audioContextRef.current.resume();
      console.log("AudioContext resumed:", audioContextRef.current.state);

      source.start(0);
      console.log("Started audio playback");
    } catch (error) {
      console.error("Error during audio playback:", error);
      isPlayingRef.current = false;
      playNextInQueue();
    }
  };

  // Add debug logging for component state
  useEffect(() => {
    console.log("AudioPlayer component state:", {
      isReady,
      audioDevices: audioDevices.map((device) => ({
        deviceId: device.deviceId,
        label: device.label,
      })),
      queueLength: audioQueueRef.current.length,
      isPlaying: isPlayingRef.current,
      contextState: audioContextRef.current?.state,
    });
  }, [isReady, audioDevices]);

  return null;
});

export default AudioPlayer;
