// frontend/src/components/ToolUsageLog.js
import React, { useState } from 'react';

function ToolUsageLog({ logs }) {
    const [open, setOpen] = useState(false);
  
    const toggleOpen = () => setOpen(!open);
  
    const formatLog = (log) => {
      const metadata = log.response_metadata;
      if (metadata && metadata.tokenUsage) {
        const { tokenUsage, model_name, finish_reason } = metadata;
        return (
          <div className="text-sm text-green-700">
            <div><strong>Model:</strong> {model_name}</div>
            <div><strong>Finish:</strong> {finish_reason}</div>
            <div>
              <strong>Tokens:</strong> prompt {tokenUsage.promptTokens}, completion {tokenUsage.completionTokens}, total {tokenUsage.totalTokens}
            </div>
          </div>
        );
      }
      return <div className="text-xs text-green-700"><pre>{JSON.stringify(log, null, 2)}</pre></div>;
    };
  
    return (
      <div className="mt-4">
        <button 
          onClick={toggleOpen}
          className="flex items-center text-green-600 font-semibold focus:outline-none"
        >
          <span className="mr-2 text-xl">{open ? '▾' : '▸'}</span>
          {open ? "Hide" : "View"} Tool Usage Details
        </button>
        {open && (
          <div className="mt-2 p-3 bg-green-100 rounded">
            {logs.map((log, index) => (
              <div key={index} className="mb-3 border-b pb-2">
                <div className="font-bold text-green-800">Step {index + 1}:</div>
                {formatLog(log)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  

export default ToolUsageLog;
