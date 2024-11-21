import { create } from "zustand";
import { persist } from "zustand/middleware";

const useUserStore = create(
  persist(
    (set) => ({
      preferences: {
        theme: "light",
        voiceId: "alloy",
        userName: "User",
      },

      setPreference: (key, value) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            [key]: value,
          },
        })),

      setAllPreferences: (preferences) => set({ preferences }),
    }),
    {
      name: "user-preferences",
    }
  )
);

export default useUserStore;
