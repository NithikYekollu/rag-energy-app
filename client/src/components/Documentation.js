// frontend/src/components/Documentation.js
import React from 'react';

function Documentation() {
  return (
    <div className="bg-white rounded-lg shadow-xl p-6 mt-6 space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Documentation</h2>
      <p className="text-gray-700">
        Welcome to the Utility Rate Assistant documentation! This application allows users to:
      </p>
      <ul className="list-disc list-inside text-gray-700">
        <li>Ask questions about U.S. utility rates</li>
        <li>View sample questions and answers</li>
        <li>Access relevant sources and documentation</li>
      </ul>

      <p className="text-gray-700">
        For more details on setup, visit our <a href="https://github.com" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">GitHub repository</a>.
      </p>

      <h3 className="text-xl font-semibold text-gray-800 mt-4">Overview</h3>
      <p className="text-gray-700">
        This Retrieval-Augmented Generation (RAG) application combines LangChain, Pinecone, and OpenAI's ChatGPT to provide real-time, context-aware answers to utility-related questions.
        It uses the <a href="https://apps.openei.org/services/doc/rest/util_rates/?version=3" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">OpenEI Utility Rate Database (URDB)</a> as the data source.
      </p>

      <h3 className="text-xl font-semibold text-gray-800 mt-4">Choosing the Format</h3>
      <p className="text-gray-700">
        I chose a <strong>Web App</strong> format to provide users with an interactive experience, supporting real-time queries and dynamic responses.
      </p>

      <h3 className="text-xl font-semibold text-gray-800 mt-4">Setting a Stretch Goal</h3>
      <p className="text-gray-700">
        My stretch goal was to create a sleek, animated chat interface emphasizing usability. Although I initially considered exploring RAFT (see the <a href="https://gorilla.cs.berkeley.edu/blogs/9_raft.html" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">RAFT blog</a>), I prioritized building a working RAG app due to time constraints.
      </p>

      <h3 className="text-xl font-semibold text-gray-800 mt-4">Fetching and Transforming Data</h3>
      <p className="text-gray-700">
        The data was fetched from the OpenEI URDB API and transformed into structured documents. Here’s a snippet from <code>urdb.js</code>:
      </p>
      <pre className="bg-gray-100 p-4 overflow-auto rounded">
        {`import axios from 'axios';

export async function fetchURDBData() {
  const response = await axios.get('https://api.openei.org/utility_rates', { 
    params: { version: '3', format: 'json', limit: 500, api_key: process.env.URDB_API_KEY }
  });
  return response.data.items || [];
}

export function transformToDocuments(data) {
  return data.map(record => ({
    pageContent: \`Utility: \${record.utility}\\nDescription: \${record.description || "N/A"}\`,
    metadata: { source: "URDB", id: record.label || "unknown_id" },
  }));
}`}
      </pre>

      <h3 className="text-xl font-semibold text-gray-800 mt-4">Indexing Data with Embeddings</h3>
      <p className="text-gray-700">
        I used OpenAI’s <strong>text-embedding-ada-002</strong> model to generate embeddings. Pinecone was chosen to store and search through these embeddings:
      </p>
      <pre className="bg-gray-100 p-4 overflow-auto rounded">
        {`import { OpenAIEmbeddings } from '@langchain/openai';
import { Pinecone } from '@pinecone-database/pinecone';

const embeddings = new OpenAIEmbeddings({ 
  openAIApiKey: process.env.OPENAI_API_KEY, modelName: "text-embedding-ada-002" 
});

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pinecone.Index(process.env.PINECONE_INDEX);

await PineconeStore.fromDocuments(documents, embeddings, { pineconeIndex: index });
`}
      </pre>

      <h3 className="text-xl font-semibold text-gray-800 mt-4">Implementing the RAG System</h3>
      <p className="text-gray-700">
        The RAG system retrieves relevant documents from Pinecone and invokes OpenAI's ChatGPT to generate responses:
      </p>
      <pre className="bg-gray-100 p-4 overflow-auto rounded">
        {`async function generate(state) {
  const vectorStore = await PineconeStore.loadFromNamespace("urdb-data");
  const retrievedDocs = await vectorStore.similaritySearch(state.query, 3);

  const prompt = [
    new SystemMessage("Provide answers using the following retrieved data:"),
    ...retrievedDocs.map(doc => new HumanMessage(doc.pageContent)),
    new HumanMessage(state.query)
  ];

  const response = await llm.invoke(prompt);
  return { messages: [response] };
}`}
      </pre>

      <h3 className="text-xl font-semibold text-gray-800 mt-4">Building the User Interface</h3>
      <p className="text-gray-700">
        The chat interface was built using <code>@chatscope/chat-ui-kit-react</code> and <code>framer-motion</code> for smooth animations:
      </p>
      <pre className="bg-gray-100 p-4 overflow-auto rounded">
        {`import { MainContainer, ChatContainer, MessageList, MessageInput } from '@chatscope/chat-ui-kit-react';
import { motion, AnimatePresence } from 'framer-motion';

function ChatPanel() {
  const [messages, setMessages] = useState([]);

  return (
    <MainContainer>
      <ChatContainer>
        <MessageList>
          <AnimatePresence>
            {messages.map(msg => (
              <motion.div key={msg.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div>{msg.content}</div>
              </motion.div>
            ))}
          </AnimatePresence>
        </MessageList>
        <MessageInput onSend={handleSend} />
      </ChatContainer>
    </MainContainer>
  );
}`}
      </pre>

      <h3 className="text-xl font-semibold text-gray-800 mt-4">Sample Questions</h3>
      <p className="text-gray-700">
        Sample questions help guide users in exploring the app:
      </p>
      <pre className="bg-gray-100 p-4 overflow-auto rounded">
        {`const questions = [
  { text: "What are the current renewable energy rates?", icon: "🍃" },
  { text: "Compare residential vs commercial utility rates", icon: "📊" },
  { text: "What energy efficiency programs are available?", icon: "⚡" }
];`}
      </pre>

      <h3 className="text-xl font-semibold text-gray-800 mt-4">Challenges and Future Improvements</h3>
      <p className="text-gray-700">
        Although I planned to explore RAFT, I focused on building the RAG system due to time constraints. Future work includes implementing RAFT to improve retrieval-based responses.
      </p>

      <h3 className="text-xl font-semibold text-gray-800 mt-4">Conclusion</h3>
      <p className="text-gray-700">
        This project showcases how AI-driven RAG systems can enhance user engagement by providing accurate, context-rich answers to specialized queries. The combination of LangChain, Pinecone, and OpenAI has established a solid foundation for further innovation on my project.
      </p>
    </div>
  );
}

export default Documentation;
