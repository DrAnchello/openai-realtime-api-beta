import React, { useState } from "react";
import { Settings } from "lucide-react";
import GlassCard from "../ui/GlassCard";
import SettingsPanel from "./SettingsPanel";

const ChatHeader = ({ isConnected, userName }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <GlassCard className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-light">AIda</h1>
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-400" : "bg-red-400"
            }`}
          />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{userName}</span>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 hover:bg-white/20 rounded-full">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </GlassCard>

      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
};

export default ChatHeader;
