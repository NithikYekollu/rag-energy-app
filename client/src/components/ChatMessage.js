// frontend/src/components/ChatMessage.js
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function ChatMessage({ message }) {
  const [showDetails, setShowDetails] = useState(false);
  const isAssistant = message.sender === 'assistant';

  // Define bubble style based on sender.
  const bubbleStyle = isAssistant 
    ? 'bg-green-500 text-white self-start' 
    : 'bg-green-700 text-white self-end';

  return (
    <div className="mb-4">
      <div className={`p-4 rounded-lg max-w-[80%] inline-block ${bubbleStyle} shadow-md`}>
        <div className="flex items-center justify-between">
          <div>{message.message}</div>
          {isAssistant && message.details && (
            <button 
              onClick={() => setShowDetails(prev => !prev)} 
              className="ml-2 focus:outline-none"
            >
              <motion.span
                animate={{ rotate: showDetails ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-xl"
              >
                ▼
              </motion.span>
            </button>
          )}
        </div>
      </div>
      <AnimatePresence>
        {showDetails && message.details && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 p-4 bg-green-100 rounded-lg text-green-800 text-sm overflow-hidden shadow-inner"
          >
            {Array.isArray(message.details) 
              ? message.details.map((detail, idx) => (
                  <div key={idx} className="mb-3 border-b pb-2">
                    <div className="font-bold">Detail {idx + 1}:</div>
                    <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(detail, null, 2)}</pre>
                  </div>
                ))
              : (
                  <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(message.details, null, 2)}</pre>
                )
            }
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ChatMessage;
