import React, { useRef, useEffect } from "react";

const AudioVisualizer = ({ audioData, isRecording }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!audioData || !isRecording) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "rgb(147, 112, 219, 0.5)";

    const bufferLength = audioData.length;
    const barWidth = (WIDTH / bufferLength) * 2.5;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (audioData[i] * HEIGHT) / 2;
      ctx.fillRect(x, HEIGHT / 2 - barHeight / 2, barWidth, barHeight);
      x += barWidth + 1;
    }
  }, [audioData, isRecording]);

  return (
    <canvas
      ref={canvasRef}
      width="400"
      height="100"
      className="w-full h-24 rounded-lg bg-white/10"
    />
  );
};

export default AudioVisualizer;
