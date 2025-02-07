// server/index.js
import express from 'express';
import cors from 'cors';
import { graphWithMemory } from './chain.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors({
  origin: '*',
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type,Authorization"
}));

app.use(express.json());

// server/index.js
// server/index.js
app.post('/conversation', async (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid payload. "messages" is required.' });
    }

    const threadConfig = {
      configurable: { thread_id: 'conversation_1' },
      streamMode: 'values',
    };

    // Process the conversation with your LangChain graph
    for await (const step of await graphWithMemory.stream({ messages }, threadConfig)) {
      // Find tool messages (which contain sources)
      const toolMessages = step.messages.filter(msg => 
        msg.additional_kwargs?.tool_calls?.[0]?.function?.name === 'retrieve'
      );

      // Extract sources from tool messages
      const sources = toolMessages.map(msg => {
        try {
          const args = JSON.parse(msg.additional_kwargs.tool_calls[0].function.arguments);
          return {
            content: args.query,
            result: args.result
          };
        } catch (error) {
          console.error('Error parsing tool message:', error);
          return null;
        }
      }).filter(Boolean);

      // Get the final assistant message
      const lastMessage = step.messages[step.messages.length - 1];
      
      // Write each step as an SSE event
      res.write(`data: ${JSON.stringify({
        content: lastMessage.content,
        type: lastMessage.type || 'message',
        sources: sources
      })}\n\n`);
    }

    // End the response after all steps are processed
    res.end();
  } catch (error) {
    console.error('Error processing conversation:', error);
    res.write(`data: ${JSON.stringify({ 
      error: 'Failed to process conversation.',
      details: error.message 
    })}\n\n`);
    res.end();
  }
});



const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
