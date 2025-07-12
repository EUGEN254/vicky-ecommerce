// --- src/pages/HelpCenter.jsx ---
import React from 'react';
import ChatBotWidget from '../components/ChatBotWidget';

const HelpCenter = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h2 className="text-2xl font-semibold mb-4">Help Center</h2>
      <p className="text-gray-700 mb-6 max-w-xl">
        Welcome to the Gracie Shoe Hub Help Center. Need help with your orders, returns, or product information? Our chatbot assistant is here to help you anytime.
      </p>
      <ChatBotWidget />
    </div>
  );
};

export default HelpCenter;