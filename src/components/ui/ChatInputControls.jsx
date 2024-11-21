import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mic, MessageCircle } from "lucide-react";
import GradientButton from "./GradientButton";

const ChatInputControls = ({
  isRecording,
  onStartRecording,
  onStopRecording,
  onSendMessage,
  isConnected
}) => {
  const [inputMode, setInputMode] = useState('voice');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <div className="p-4 border-t border-white/20">
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setInputMode('voice')}
          className={`p-2 rounded-lg ${inputMode === 'voice' ? 'bg-white/20' : 'hover:bg-white/10'}`}
        >
          <Mic className="w-5 h-5" />
        </button>
        <button
          onClick={() => setInputMode('text')}
          className={`p-2 rounded-lg ${inputMode === 'text' ? 'bg-white/20' : 'hover:bg-white/10'}`}
        >
          <MessageCircle className="w-5 h-5" />
        </button>
      </div>

      {inputMode === 'voice' ? (
        <div className="flex justify-center">
          <GradientButton
            onClick={isRecording ? onStopRecording : onStartRecording}
            disabled={!isConnected}
            variant={isRecording ? "danger" : "primary"}
            className="w-16 h-16 rounded-full p-0 flex items-center justify-center"
          >
            <motion.div
              animate={isRecording ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {isRecording ? (
                <div className="w-4 h-4 bg-white rounded-sm" />
              ) : (
                <div className="w-4 h-8 bg-white rounded-full" />
              )}
            </motion.div>
          </GradientButton>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:border-white/40"
          />
          <GradientButton
            type="submit"
            disabled={!message.trim() || !isConnected}
          >
            Send
          </GradientButton>
        </form>
      )}
    </div>
  );
};

export default ChatInputControls;
