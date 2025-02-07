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
        For more details on setup, check out our GitHub repository.
      </p>
    </div>
  );
}

export default Documentation;
