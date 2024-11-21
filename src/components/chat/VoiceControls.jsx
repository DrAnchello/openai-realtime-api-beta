import React from "react";
import { motion } from "framer-motion";
import GradientButton from "../ui/GradientButton";

const VoiceControls = ({
  isRecording,
  onStartRecording,
  onStopRecording,
  isConnected,
}) => {
  const handleClick = () => {
    if (isRecording) {
      onStopRecording();
    } else {
      onStartRecording();
    }
  };

  return (
    <div className="flex justify-center items-center gap-4 p-4">
      <GradientButton
        onClick={handleClick}
        disabled={!isConnected}
        variant={isRecording ? "danger" : "primary"}
        className="w-16 h-16 rounded-full p-0 flex items-center justify-center">
        <motion.div
          animate={isRecording ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}>
          {isRecording ? (
            <div className="w-4 h-4 bg-white rounded-sm" />
          ) : (
            <div className="w-4 h-8 bg-white rounded-full" />
          )}
        </motion.div>
      </GradientButton>
    </div>
  );
};

export default VoiceControls;
