// server/indexData.js
import dotenv from 'dotenv';
import { fetchURDBData, transformToDocuments } from './urdb.js';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'; 
import { OpenAIEmbeddings } from '@langchain/openai';
import { PineconeStore } from '@langchain/pinecone';
import { Pinecone } from '@pinecone-database/pinecone';

dotenv.config();

async function indexData() {
  // 1. Fetch raw URDB data.
  const rawData = await fetchURDBData();
  if (!rawData.length) {
    console.error("No data fetched. Exiting indexing process.");
    return;
  }

  // 2. Transform raw data into Documents.
  const documents = transformToDocuments(rawData);
  console.log(`Transformed data into ${documents.length} documents.`);

  // 3. Split documents into smaller chunks.
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const allSplits = await splitter.splitDocuments(documents);
  console.log(`Split documents into ${allSplits.length} chunks.`);

  // 4. Create an embeddings instance.
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: "text-embedding-ada-002",
  });

  // 5. Initialize Pinecone and connect to your index.
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });
  const index = pinecone.Index(process.env.PINECONE_INDEX);

  // 6. Create the vector store and add the document chunks.
  const vectorStore = await PineconeStore.fromDocuments(allSplits, embeddings, {
    pineconeIndex: index,
    namespace: "urdb-data",
    textKey: "text"
  });

  console.log("Indexing complete. Documents stored in Pinecone.");
}

indexData().catch((err) => console.error("Error during indexing:", err));