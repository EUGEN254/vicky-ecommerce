import React, { useContext, useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import axios from 'axios';
import { AppContent } from '../context/AppContext';

const ChatBotWidget = ({ show, onClose, onToggle }) => {
  const [messages, setMessages] = useState([
    { 
      from: 'bot',
      text: "👋 Hi! I'm Vick's Bot. How can I help you?"
    }
  ]);

  const [input, setInput] = useState('');
  const {backendUrl} = useContext(AppContent)

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { 
      from: 'user', 
      text: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    try {
      const res = await axios.post(`${backendUrl}/api/chatbot/message`, { message: input });
      const botMessage = { from: 'bot', text: res.data.reply };
      setMessages((prev) => [...prev, botMessage]);
    } catch {
      setMessages((prev) => [...prev, 
        { 
          from: 'bot', 
          text: 'Sorry, I couldn’t process that.' 
        }]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Interface */}
      {show && (
        <div className="bg-white w-80 h-96 shadow-xl rounded-xl flex flex-col overflow-hidden border border-gray-200 mb-2">
          <div className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between">
            <span className="font-semibold">GracieBot</span>
            <X 
              onClick={onClose} 
              className="cursor-pointer hover:scale-110 transition-transform" 
              size={20}
            />
          </div>
          <div className="flex-1 p-3 overflow-y-auto space-y-2 text-sm">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-2 rounded max-w-[75%] ${
                  msg.from === 'user' 
                    ? 'bg-black text-white ml-auto' 
                    : 'bg-gray-200 text-black mr-auto'
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>
          <div className="p-2 border-t flex">
            <input
              className="flex-1 px-3 py-2 border rounded-l text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="bg-black text-white px-4 py-2 rounded-r text-sm hover:bg-gray-800 transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        className="bg-black text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
        onClick={onToggle}
        aria-label="Toggle ChatBot"
      >
        <MessageCircle size={24} />
      </button>
    </div>
  );
};

export default ChatBotWidget;