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

  async *sendMessageStream(message) {
    if (!this.pinecone) {
      yield "Configuration Error: Pinecone API Key is missing. Please check your .env file.";
      return;
    }

    try {
      // 1. Rewrite the query based on history
      const rewrittenQuery = await this.transformQuery(message);

      // 2. Convert rewritten query to vector
      const embeddingResult = await this.ai.models.embedContent({
        model: 'text-embedding-004',
        contents: [{ parts: [{ text: rewrittenQuery }] }]
      });
      const queryVector = embeddingResult.embeddings?.[0]?.values;

      if (!queryVector) {
        throw new Error("Failed to generate embedding.");
      }

      // 3. Query Pinecone
      const index = this.pinecone.index(this.indexName);
      const searchResults = await index.query({
        topK: 10,
        vector: queryVector,
        includeMetadata: true,
      });

      const context = searchResults.matches
        ?.map((match) => match.metadata?.text)
        .join("\n\n---\n\n") || "";

      // 4. Update history with the REWRITTEN query
      this.history.push(this.formatContent('user', rewrittenQuery));

      // 5. Generate Answer with Context
      const stream = await this.ai.models.generateContentStream({
        model: this.modelId,
        contents: this.history,
        config: {
          systemInstruction: `You are a chatbot capable of answering questions strictly using the provided Eldoria kingdom dataset.
          Set in the vast medieval realm of Eldoria, a kingdom forged in the aftermath of ancient wars against ogre clans that once threatened humanity’s existence.
           Eldoria is a land shaped by elemental magic, political intrigue, and diverse cultures. Its territories range from towering frostbitten mountains to enchanted 
           forests that shift their paths, volcanic ridges, forbidden swamps, bustling trade towns, sacred rivers, and a fortified capital built over ancient mana wells.
            Within Eldoria operate powerful groups such as knightly orders sworn by the Code of Steel, mage circles that command fire, nature, shadow, and storm, assassin brotherhoods that move unseen, 
            and warrior tribes of the north hardened by ice and battle. The kingdom’s history is marked by civil wars, arcane disasters, ancient prophecies, and legendary artifacts—some holy, some cursed, 
            some capable of reshaping fate itself. Modern threats now rise again: ogre warlords unite, crops fail, forbidden magic resurges, the dead grow restless, and prophecies foretell coming doom. 
            This rich, interconnected world contains names, dates, events, places, factions, relics, species, magical laws, and political systems— requiring careful retrieval rather than guesswork.
          And never say dataset in your response instead say i dont have that info or be creative say no politely. Give answers with 100% accuracy.

          And at last only if user questions is answered fully and there is no follow up question then can ask user if have any more questions  in new line ask if user want more questions dont use same sentence everytime like ask me anything,
 for example user asked a question Q1. What event is prophesied to occur “when the moon weeps red,” and which faction is responsible for confronting it?
      then you can provide the answer like ---
The prophecy says that “the dead shall walk” when the moon weeps red, signaling a massive undead uprising. The Oathbound Paladins are the faction prepared to confront this threat, using their sacred light magic against corruption and undead forces.

Context: ${context}`,
        },
      });

      let fullResponse = "";
      for await (const chunk of stream) {
        if (chunk.text) {
          fullResponse += chunk.text;
          yield chunk.text;
        }
      }

      // 6. Save model response to history
      this.history.push(this.formatContent('model', fullResponse));

    } catch (error) {
      console.error("Error in RAG pipeline:", error);
      yield "I encountered an error while searching the archives. Please try again.";
    }
  }
}

export const geminiService = new GeminiService();

