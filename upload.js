
import path from 'path'; 
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
// --- Define __dirname for ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// --- Load .env from the current directory (rag/) ---
const result = config({ 
    path: path.resolve(__dirname, '.env') 
}); 

// --- DIAGNOSIS CHECK ---
if (result.error) {
    console.error("❌ DOTENV ERROR: Check file existence/name.");
} else {
    // 🎯 CRITICAL: This logs the actual variables read from the file.
    console.log('\n--- 🧠 DOTENV LOADED CONTENTS ---');
    console.log(result.parsed); 
    console.log('----------------------------------\n');
}

console.log('Index Name Check:', process.env.PINECONE_INDEX_NAME);




import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { Pinecone } from '@pinecone-database/pinecone';
import { PineconeStore } from '@langchain/pinecone';

async function indexDocument(){
    const PDF_PATH = './rag/data.pdf';
const pdfLoader = new PDFLoader(PDF_PATH);
const rawDocs = await pdfLoader.load();
console.log("pdf loaded...");




//chunking

const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
const chunkedDocs = await textSplitter.splitDocuments(rawDocs);
console.log("chunking completed...")

//vector embedding model to convert into vector

const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GEMINI_API_KEY,
    model: 'text-embedding-004',
  });
console.log("embedding completed");

//   configuring database

const pinecone = new Pinecone({
    apiKey: '',
});
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);
// console.log(pineconeIndex);

//langchain (give chunking,embedding model,database to be used)will tell to langchain

await PineconeStore.fromDocuments(chunkedDocs, embeddings, {
    pineconeIndex,
    maxConcurrency: 1,
  });
console.log("data stored successfully");
}


indexDocument();