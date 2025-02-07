// testPinecone.mjs
import pkg from '@pinecone-database/pinecone';
const { PineconeClient } = pkg;
import dotenv from 'dotenv';

dotenv.config();

async function listIndexes() {
  const pinecone = new PineconeClient();
  await pinecone.init({
    apiKey: process.env.PINECONE_API_KEY,
    environment: process.env.PINECONE_ENVIRONMENT,
  });
  
  const indexes = await pinecone.listIndexes();
  console.log("Available indexes:", indexes);
}

listIndexes().catch((err) => console.error("Error listing indexes:", err));
