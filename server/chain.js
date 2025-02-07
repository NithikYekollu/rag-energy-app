// chain.js
import dotenv from 'dotenv';
dotenv.config();

import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { Pinecone } from '@pinecone-database/pinecone';
import { PineconeStore } from '@langchain/pinecone';
import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
  ToolMessage
} from '@langchain/core/messages';
import { MessagesAnnotation, StateGraph, MemorySaver } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';

// Create the chat model instance (GPT-4o)
const llm = new ChatOpenAI({
  openAIApiKey: process.env.GPT4O_API_KEY,
  modelName: 'gpt-4o-2024-11-20',
  temperature: 0.2,
});

// Create the embeddings instance for retrieval
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: 'text-embedding-ada-002',
});

// Function to re-create the vector store from the existing Pinecone index
async function createVectorStore() {
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });
  const index = pinecone.Index(process.env.PINECONE_INDEX);
  const vectorStore = await PineconeStore.fromExistingIndex(
    embeddings,
    {
      pineconeIndex: index,
      namespace: 'urdb-data',
      textKey: 'text',
    }
  );
  return vectorStore;
}

// Define the retrieval tool using the vector store
const retrieveSchema = z.object({ query: z.string() });
const retrieve = tool(
  async ({ query }) => {
    const vectorStore = await createVectorStore();
    const retrievedDocs = await vectorStore.similaritySearch(query, 3);
    const serialized = retrievedDocs
      .map(
        (doc) =>
          `Source: ${doc.metadata.source}\nContent: ${doc.pageContent}`
      )
      .join("\n");
    return [serialized, retrievedDocs];
  },
  {
    name: "retrieve",
    description: "Retrieve utility rate information based on a query.",
    schema: retrieveSchema,
    responseFormat: "content_and_artifact",
  }
);

// Function: queryOrRespond
// We simply pass the conversation history to the LLM with bound tools.
async function queryOrRespond(state) {
  const llmWithTools = llm.bindTools([retrieve]);
  const response = await llmWithTools.invoke(state.messages);
  return { messages: [response] };
}

// Create a ToolNode to execute the retrieval tool.
const tools = new ToolNode([retrieve]);

// Function: generate
// Generate the final answer using retrieved context.
async function generate(state) {
  let recentToolMessages = [];
  for (let i = state.messages.length - 1; i >= 0; i--) {
    const message = state.messages[i];
    if (message instanceof ToolMessage) {
      recentToolMessages.push(message);
    } else {
      break;
    }
  }
  const toolMessages = recentToolMessages.reverse();
  const docsContent = toolMessages.map((msg) => msg.content).join("\n");

  // Construct a system prompt that guides the assistant to use the retrieved context.
  const systemMessageContent =
    "You are an assistant that provides accurate information about U.S. utility rates. " +
    "Use the context below to answer the user's question. If you don't have sufficient data, say that you don't know. " +
    "Keep your response concise (three sentences maximum)." +
    "\n\n" +
    docsContent;

  const conversationMessages = state.messages.filter(
    (message) =>
      message instanceof HumanMessage ||
      message instanceof SystemMessage ||
      (message instanceof AIMessage &&
        (!message.tool_calls || message.tool_calls.length === 0))
  );
  const prompt = [
    new SystemMessage(systemMessageContent),
    ...conversationMessages,
  ];
  const response = await llm.invoke(prompt);
  return { messages: [response] };
}

// Build the state graph for the multi-turn conversation using MessagesAnnotation.
// We modify the control flow to always pass through the tools node.
const graphBuilder = new StateGraph(MessagesAnnotation)
  .addNode("queryOrRespond", queryOrRespond)
  .addNode("tools", tools)
  .addNode("generate", generate)
  .addEdge("__start__", "queryOrRespond")
  // Always call the retrieval tools after queryOrRespond.
  .addEdge("queryOrRespond", "tools")
  .addEdge("tools", "generate")
  .addEdge("generate", "__end__");

// Use MemorySaver as the in-memory checkpointer to persist conversation history.
const checkpointer = new MemorySaver();
const graphWithMemory = graphBuilder.compile({ checkpointer });

export { graphWithMemory };
