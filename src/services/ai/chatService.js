import axios from "axios";
import { aidaBrain } from "./aidaBrain";
import realtimeService from "./realtimeService";

class ChatService {
  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    this.currentConversationId = null;
    this.defaultUserId = "default-user";
  }

  async sendTextMessage(text) {
    try {
      // Ensure we have a conversation
      if (!this.currentConversationId) {
        this.currentConversationId = await aidaBrain.startConversation(
          this.defaultUserId
        );
      }

      // Add user message to database
      await aidaBrain.addMessage(this.currentConversationId, "user", text);

      // Get recent messages for context
      const messages = await aidaBrain.getAllMessages(
        this.currentConversationId
      );

      // Get related memories (will be empty initially)
      const memories = await aidaBrain.findRelatedMemories(text);

      // Prepare the conversation history
      const conversationHistory = messages.slice(-5).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Make API call
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: `You are AIda, a helpful AI assistant. Previous memories: ${memories
                .map((m) => m.content)
                .join(". ")}`,
            },
            ...conversationHistory,
          ],
          max_tokens: 1000,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      const assistantMessage = response.data.choices[0].message;

      // Store assistant's response
      await aidaBrain.addMessage(
        this.currentConversationId,
        "assistant",
        assistantMessage.content
      );

      // Return formatted message for UI
      return {
        role: "assistant",
        text: assistantMessage.content,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  async sendAudio(audioData) {
    try {
      await realtimeService.client.appendInputAudio(audioData);
      return true;
    } catch (error) {
      console.error("Error sending audio:", error);
      throw error;
    }
  }
}

export default new ChatService();
