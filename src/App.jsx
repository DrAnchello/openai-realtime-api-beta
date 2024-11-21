import React, { useEffect, useState } from "react";
import ParticleBackground from "./components/ui/ParticleBackground";
import DashboardLayout from "./components/DashboardLayout";
import useConversationStore from "./stores/conversationStore";
import useUserStore from "./stores/userStore";
import realtimeService from "./services/ai/realtimeService";

export default function App() {
  const { setConnected } = useConversationStore();
  const { preferences } = useUserStore();
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
        if (!apiKey) {
          throw new Error("API key not found");
        }

        await realtimeService.initialize(apiKey);
        setConnected(true);
      } catch (error) {
        console.error("Failed to initialize:", error);
        setInitError(error.message);
        setConnected(false);
      }
    };

    initializeApp();

    return () => {
      realtimeService.disconnect().catch(console.error);
    };
  }, [setConnected]);

  if (initError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Error initializing: {initError}</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <ParticleBackground color="#f7797d" count={40} />
      <div className="relative z-10">
        <DashboardLayout userName={preferences.userName} />
      </div>
    </div>
  );
}
