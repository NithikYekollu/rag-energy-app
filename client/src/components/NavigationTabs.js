// frontend/src/components/NavigationTabs.js
import React from 'react';
import { motion } from 'framer-motion';

function NavigationTabs({ currentTab, setCurrentTab }) {
  const tabs = [
    { name: 'Home', id: 'home' },
    { name: 'Documentation', id: 'docs' },
    { name: 'GitHub', id: 'github', link: 'https://github.com/NithikYekollu/rag-energy-app' }
  ];

  return (
    <div className="flex items-center justify-center gap-6 bg-green-100 py-4 rounded-lg shadow-lg">
      {tabs.map((tab) => (
        <motion.button
          key={tab.id}
          onClick={() => tab.id !== 'github' && setCurrentTab(tab.id)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={`text-lg font-semibold ${
            currentTab === tab.id ? 'text-green-900 underline' : 'text-green-700'
          }`}
        >
          {tab.link ? (
            <a href={tab.link} target="_blank" rel="noopener noreferrer">
              {tab.name}
            </a>
          ) : (
            tab.name
          )}
        </motion.button>
      ))}
    </div>
  );
}

export default NavigationTabs;
