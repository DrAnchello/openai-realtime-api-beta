import { create } from "zustand";
import { persist } from "zustand/middleware";
import chatService from "../services/ai/chatService";

const useConversationStore = create(
  persist(
    (set, get) => ({
      messages: [],
      isRecording: false,
      isConnected: false,
      audioData: null,

      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, message],
        })),

      sendMessage: async (text) => {
        const userMessage = {
          role: "user",
          text,
          timestamp: Date.now(),
        };

        set((state) => ({
          messages: [...state.messages, userMessage],
        }));

        try {
          const aiResponse = await chatService.sendTextMessage(text);
          set((state) => ({
            messages: [...state.messages, aiResponse],
          }));
        } catch (error) {
          console.error("Failed to get AI response:", error);
        }
      },

      setRecording: (isRecording) => set({ isRecording }),
      setConnected: (isConnected) => set({ isConnected }),
      setAudioData: (audioData) => set({ audioData }),
      clearMessages: () => {
        chatService.clearHistory();
        set({ messages: [] });
      },
    }),
    {
      name: "conversation-storage",
      getStorage: () => localStorage,
    }
  )
);

export default useConversationStore;
