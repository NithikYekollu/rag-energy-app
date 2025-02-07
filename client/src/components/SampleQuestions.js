// frontend/src/components/SampleQuestions.js
import React from 'react';

const questions = [
  { text: "What are the current renewable energy rates?", icon: "🍃" },
  { text: "Compare residential vs commercial utility rates", icon: "🍃" },
  { text: "What energy efficiency programs are available?", icon: "🍃" }
];

function SampleQuestions({ onSelect }) {
  return (
    <div className="bg-green-50 rounded-lg shadow-xl p-6">
      <h2 className="text-2xl font-bold text-green-800 mb-4">Suggested Questions</h2>
      <div className="space-y-4">
        {questions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(q.text)}
            className="w-full text-left p-4 rounded-lg border border-green-300 hover:bg-green-100 transition-colors flex items-center gap-3"
          >
            <span className="text-2xl">{q.icon}</span>
            <span className="text-green-900 text-lg">{q.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}


export default SampleQuestions;
