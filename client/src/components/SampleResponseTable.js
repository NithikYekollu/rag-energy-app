// frontend/src/components/SampleResponseTable.js
import React from 'react';

function SampleResponseTable({ responses }) {
  return (
    <div className="bg-white rounded-lg shadow-xl p-6 mt-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Sample Responses</h2>
      <div className="overflow-x-auto">
        <table className="table-auto w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="px-4 py-2 text-gray-600 font-medium">Question</th>
              <th className="px-4 py-2 text-gray-600 font-medium">Answer</th>
              <th className="px-4 py-2 text-gray-600 font-medium">Sources</th>
            </tr>
          </thead>
          <tbody>
            {responses.map((response, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2 text-gray-800">{response.question}</td>
                <td className="px-4 py-2 text-gray-800">{response.answer}</td>
                <td className="px-4 py-2">
                  {response.sources.map((source, index) => (
                    <div key={index} className="mb-2">
                      <p className="text-sm text-gray-600">{source.content}</p>
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SampleResponseTable;
