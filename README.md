# VeritasPrime

**VeritasPrime** — a RAG-implemented chatbot

## 🚀 What is VeritasPrime

VeritasPrime is a chatbot built using the principles of **Retrieval‑Augmented Generation (RAG)**. It is designed to let users upload data or documents (or use predefined sources), retrieve relevant context from those sources, and generate intelligent answers — helping you build a context-aware, document-grounded conversational AI.  

RAG lets language models ground their responses in external documents or knowledge bases, which helps produce more accurate and context-relevant answers. 

## 📁 Repository Structure

/ — root folder
/upload.js (to upload lorebook)

prime — core code files (or main modules)
/prime/src/ App.jsx , Main.jsx , Index.html , .env
/prime/src/components/ AppIcons.jsx , ChatInput.jsx , MessageBubble.jsx
/prime/src/services/gemini.js
VeritasPrime/upload.js — script to upload documents or data (if applicable)



## ✅ Features (Intended)

- Document ingestion / upload  
- Context retrieval from ingested data  
- Natural-language Q&A or chatbot interface grounded on the ingested data  
- Ability to provide answers based on external documents (not just model’s prior knowledge) — thanks to RAG  

## 💻 Prerequisites

- Node.js (for `upload.js` / frontend/backend)   
- Required environment variables or configs (e.g. API keys,Vector Database API Key)  
- A data source(Lorebook): documents, files, or a database to upload content for the chatbot to use.  

## 🚀 Getting Started / How to Run

1. Clone the repository  
   ```
   git clone https://github.com/yourusername/VeritasPrime.git
   cd VeritasPrime/prime
   ```


2.Install dependencies
```
npm init -y
npm install
npm i @langchain/pinecone @langchain/core @pinecone-database/pinecone @langchain/community @google/genai @langchain/google-genai @langchain/textsplitters dotenv pdf-parse readline-sync
```

3.Update env file
Update your Gemini Api Key,Pinecone vector Database API key,Pinecone vector database Index name in prime/.env.


4.If there is an upload script(Lorebook)
Open VeritasPrime/upload.js, At line 34 give path to your lorebook.
Run
```
cd VeritasPrime
node upload.js
```
Cross-Check Database file will be uploaded.


# Start the application 
```
cd VeritasPrime/prime
npm run dev
```
Interact with the chatbot via web UI 
Ask questions — the system will retrieve relevant context and produce answers.

🧠 How It Works (Overview)
Data Ingestion — Users upload documents/data through the upload interface or script.

Context Indexing — The uploaded data is processed: broken into chunks or indexed so that relevant parts can be retrieved when needed.

Query + Retrieval — When a user asks a question, the system searches the indexed data for relevant context.

Answer Generation — Using the retrieved context + (optionally) conversation history, the system passes everything to an underlying LLM (or generation engine) to craft a well-informed answer.

Response — The chatbot returns the response to the user, grounded in the data — reducing hallucinations, improving relevance.


🤝 Contributing
Contributions are welcome! If you’d like to help, please:

Fork the repository

Create a new branch for your feature/fix

Submit a Pull Request describing your changes

⚠️ Disclaimer / Notes
Ensure that data uploaded is clean and well-formatted — poor data may lead to poor answers.

If using external APIs or LLMs, ensure privacy and security of sensitive data.

Depending on data size, indexing and retrieval might be resource-heavy.
