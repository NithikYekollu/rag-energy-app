// frontend/src/App.js
import React, { useState } from 'react';
import ChatPanel from './components/ChatPanel';
import SampleQuestions from './components/SampleQuestions';
import SampleResponseTable from './components/SampleResponseTable';
import Documentation from './components/Documentation';
import NavigationTabs from './components/NavigationTabs';

function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [pendingQuestion, setPendingQuestion] = useState('');

  const sampleResponses = [
    {
      question: 'What are the current renewable energy rates?',
      answer: 'Renewable energy is offered at a premium of $0.019 per kWh on a voluntary basis.',
      sources: [
        {
          content: '*Renewable energy resources include wind, solar, etc., offered at $0.019 per kWh.',
          uri: 'https://apps.openei.org/USURDB/rate/view/539f6a54ec4f024411ec8dcf'
        }
      ]
    },
    {
      question: 'What energy efficiency programs are available?',
      answer: 'For Southwestern Electric Power Co (Texas), the Energy Efficiency Cost Recovery Factor (EECRF) is $0.000947 per kWh.',
      sources: [
        {
          content: 'Energy Efficiency Cost Recovery Rider for General Service is $0.000947 per kWh.',
          uri: 'https://apps.openei.org/USURDB/rate/view/539f6a63ec4f024411ec8ecd'
        }
      ]
    },
    {
      question: 'Compare residential vs commercial utility rates.',
      answer: 'Residential fixed monthly charges range from $0.94 to $12.65, while commercial charges range from $10 to $32.50.',
      sources: [
        {
          content: 'Utility: City of Washington, Utah. Fixed monthly charge for commercial is $32.50.',
          uri: 'https://apps.openei.org/USURDB/rate/view/539f6a54ec4f024411ec8dd7'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-50 to-blue-50 p-8">
      <NavigationTabs currentTab={currentTab} setCurrentTab={setCurrentTab} />
      
      <div className="max-w-4xl mx-auto mt-8">
        {currentTab === 'home' && (
          <>
            <SampleQuestions onSelect={setPendingQuestion} />
            <ChatPanel pendingQuestion={pendingQuestion} clearPendingQuestion={() => setPendingQuestion('')} />
            <SampleResponseTable responses={sampleResponses} />
          </>
        )}
        {currentTab === 'docs' && <Documentation />}
      </div>
    </div>
  );
}

export default App;
