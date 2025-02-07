import React, { useState, useEffect } from 'react';
import {
  MainContainer,
  ChatContainer,
  MessageList,
  MessageInput,
  ConversationHeader,
} from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { motion, AnimatePresence } from 'framer-motion';

function ChatPanel({ pendingQuestion, clearPendingQuestion }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pendingQuestion) {
      handleSend(pendingQuestion);
      clearPendingQuestion();
    }
  }, [pendingQuestion]);

  const handleSend = async (text) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now(),
      message: text,
      sender: 'user',
      direction: 'outgoing'
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.message
          }))
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = null;
      let currentSources = [];

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const events = chunk.split('\n\n').filter(event => event.startsWith('data:'));

        for (const event of events) {
          try {
            const parsed = JSON.parse(event.replace(/^data:\s*/, ''));
            
            if (parsed.content && typeof parsed.content === 'string') {
              // Check if this is a source/tool message
              if (parsed.content.startsWith('Source: URDB')) {
                currentSources.push({
                  content: parsed.content,
                  uri: parsed.content.match(/URI: (.*?)(?:\n|$)/)?.[1] || ''
                });
              } else {
                // This is the final assistant message
                assistantMessage = {
                  id: Date.now(),
                  message: parsed.content,
                  sender: 'assistant',
                  direction: 'incoming',
                  sources: currentSources
                };
              }
            }
          } catch (error) {
            console.error('Error parsing SSE event:', error);
          }
        }
      }

      if (assistantMessage) {
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error in conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[600px] flex flex-col bg-gradient-to-br from-ecoLightGreen to-ecoLightBlue rounded-lg shadow-xl">
      <MainContainer>
        <ChatContainer>
          <ConversationHeader>
            <ConversationHeader.Content userName="Utility Rate Assistant" />
          </ConversationHeader>

          <MessageList 
            typingIndicator={loading ? 'Assistant is typing...' : null}
          >
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="px-4 py-2"
                >
                  <div className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      msg.sender === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <div className="message-content">{msg.message}</div>
                      
                      {msg.sender === 'assistant' && msg.sources && msg.sources.length > 0 && (
                        <div className="mt-2 text-sm border-t border-gray-200 pt-2">
                          <details>
                            <summary className="cursor-pointer font-medium text-gray-600 hover:text-gray-800">
                              View Sources ({msg.sources.length})
                            </summary>
                            <div className="mt-2 space-y-2">
                              {msg.sources.map((source, idx) => (
                                <div key={idx} className="pl-2 border-l-2 border-gray-300">
                                  <p className="text-gray-600 whitespace-pre-wrap">{source.content}</p>
                                  {source.uri && (
                                    <a 
                                      href={source.uri}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-500 hover:underline text-xs"
                                    >
                                      View Source
                                    </a>
                                  )}
                                </div>
                              ))}
                            </div>
                          </details>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </MessageList>

          <MessageInput 
            placeholder="Ask about utility rates..."
            onSend={handleSend}
            attachButton={false}
          />
        </ChatContainer>
      </MainContainer>
    </div>
  );
}

export default ChatPanel;