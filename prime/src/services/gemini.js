import { GoogleGenAI } from "@google/genai";
import { Pinecone } from "@pinecone-database/pinecone";

class GeminiService {
  constructor() {
    const apiKey = import.meta.env.VITE_API_KEY;
    if (!apiKey) {
      console.error("Gemini API Key is missing! Make sure VITE_API_KEY is set in your .env file.");
    }
    
    this.ai = new GoogleGenAI({ apiKey: apiKey });
    this.pinecone = null;
    this.history = [];
    this.modelId = "gemini-2.5-flash";
    this.indexName = "eldoria-index";

    // Initialize Pinecone
    const pineconeKey = import.meta.env.VITE_PINECONE_API_KEY;
    
    // Check for optional index name override
    if (import.meta.env.VITE_PINECONE_INDEX_NAME) {
      this.indexName = import.meta.env.VITE_PINECONE_INDEX_NAME;
    }

    if (pineconeKey) {
      // In Pinecone SDK v3, 'environment' is inferred from the API key and does not need to be passed explicitly.
      this.pinecone = new Pinecone({ apiKey: pineconeKey });
    } else {
      console.warn("Pinecone API Key not found. RAG functionality will be limited.");
    }
  }

  startChat() {
    // Reset history for a new session
    this.history = [];
  }

  formatContent(role, text) {
    return { role, parts: [{ text }] };
  }

  async transformQuery(question) {
    // Push temporary user question to history for context
    this.history.push(this.formatContent('user', question));

    try {
      const response = await this.ai.models.generateContent({
        model: this.modelId,
        contents: this.history,
        config: {
          systemInstruction: `You are a query rewriting expert. Based on the provided chat history, rephrase the "Follow Up user Question" into a complete, standalone question that can be understood without the chat history.
    Only output the rewritten question and nothing else. And if user wishes you can wish back politely.`,
        },
      });

      // Remove the original question from history
      this.history.pop();
      return response.text || question;
    } catch (e) {
      this.history.pop();
      console.error("Error transforming query", e);
      return question;
    }
  }


export const geminiService = new GeminiService();
