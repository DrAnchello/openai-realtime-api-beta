import Dexie from "dexie";

class AidaBrain extends Dexie {
  constructor() {
    super("AidaBrain");

    // Start with basic schema
    this.version(1).stores({
      conversations: "++id, userId, timestamp",
      messages: "++id, conversationId, timestamp, role, content",
      memories: "++id, type, content, timestamp, importance",
    });

    // Initialize tables
    this.conversations = this.table("conversations");
    this.messages = this.table("messages");
    this.memories = this.table("memories");

    // Bind methods to ensure correct 'this' context
    this.processConversation = this.processConversation.bind(this);
    this.startConversation = this.startConversation.bind(this);
    this.addMessage = this.addMessage.bind(this);
    this.getAllMessages = this.getAllMessages.bind(this);
    this.findRelatedMemories = this.findRelatedMemories.bind(this);
  }

  async startConversation(userId) {
    try {
      const id = await this.conversations.add({
        userId: String(userId),
        timestamp: Date.now(),
      });
      console.log("Created conversation with ID:", id);
      return id;
    } catch (error) {
      console.error("Error starting conversation:", error);
      throw error;
    }
  }

  async addMessage(conversationId, role, content) {
    try {
      const message = {
        conversationId: Number(conversationId),
        timestamp: Date.now(),
        role,
        content: typeof content === "string" ? content : content.content,
      };

      const id = await this.messages.add(message);
      console.log("Added message:", id);
      return id;
    } catch (error) {
      console.error("Error adding message:", error);
      throw error;
    }
  }

  async getAllMessages(conversationId) {
    try {
      return await this.messages
        .where("conversationId")
        .equals(Number(conversationId))
        .toArray();
    } catch (error) {
      console.error("Error getting messages:", error);
      return [];
    }
  }

  async findRelatedMemories(query, limit = 5) {
    try {
      // Simple implementation for now
      return await this.memories
        .orderBy("timestamp")
        .reverse()
        .limit(limit)
        .toArray();
    } catch (error) {
      console.error("Error finding memories:", error);
      return [];
    }
  }

  async processConversation(conversationId) {
    try {
      console.log("Processing conversation:", conversationId);

      // Get the last 50 messages
      const messages = await this.messages
        .where("conversationId")
        .equals(Number(conversationId))
        .reverse()
        .limit(50)
        .toArray();

      if (messages.length < 3) {
        console.log("Not enough messages to process yet");
        return false;
      }

      // Extract key points and create memories
      const userMessages = messages.filter((m) => m.role === "user");
      const assistantMessages = messages.filter((m) => m.role === "assistant");

      // Create a summary memory
      const summary = {
        type: "conversation_summary",
        content:
          `Conversation with ${messages.length} messages. ` +
          `${userMessages.length} user messages, ${assistantMessages.length} assistant messages.`,
        importance: 0.5,
        timestamp: Date.now(),
      };

      // Store the summary
      await this.memories.add(summary);

      // Extract potential key points from user messages
      for (const msg of userMessages) {
        if (msg.content.length > 50) {
          // Only process substantial messages
          await this.memories.add({
            type: "user_input",
            content: msg.content,
            importance: 0.3,
            timestamp: msg.timestamp,
          });
        }
      }

      console.log("Conversation processing complete");
      return true;
    } catch (error) {
      console.error("Error processing conversation:", error);
      throw error;
    }
  }

  async addMemory(type, content, importance = 0.5) {
    try {
      return await this.memories.add({
        type,
        content,
        importance,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("Error adding memory:", error);
      throw error;
    }
  }
}

// Create and export a single instance
const aidaBrain = new AidaBrain();

export { aidaBrain };
