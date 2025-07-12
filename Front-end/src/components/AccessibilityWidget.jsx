import React, { useState, useEffect } from 'react';
import { Accessibility, X } from 'lucide-react';

const AccessibilityWidget = ({ show, onClose, onToggle }) => {
  const [isLargeText, setIsLargeText] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [screenReaderMode, setScreenReaderMode] = useState(false);
  const [dyslexicFont, setDyslexicFont] = useState(false);

  // Text-to-Speech Function
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  // Load dyslexia-friendly font
  useEffect(() => {
    if (dyslexicFont) {
      const link = document.createElement('link');
      link.href = 'https://fonts.cdnfonts.com/css/opendyslexic';
      link.rel = 'stylesheet';
      link.id = 'dyslexic-font-link';
      document.head.appendChild(link);
      document.body.classList.add('dyslexic-font');
    } else {
      document.body.classList.remove('dyslexic-font');
      const link = document.getElementById('dyslexic-font-link');
      if (link) link.remove();
    }
  }, [dyslexicFont]);

  // Feature toggles
  const toggleLargeText = () => {
    setIsLargeText((prev) => {
      document.body.classList.toggle('large-text', !prev);
      return !prev;
    });
  };

  const toggleHighContrast = () => {
    setIsHighContrast((prev) => {
      document.body.classList.toggle('high-contrast', !prev);
      return !prev;
    });
  };

  const toggleScreenReader = () => {
    setScreenReaderMode((prev) => {
      const enabled = !prev;
      if (enabled) speak("Screen reader mode activated");
      else speechSynthesis.cancel();
      return enabled;
    });
  };

  const toggleDyslexicFont = () => {
    setDyslexicFont((prev) => !prev);
  };

  return (
    <div className="fixed bottom-6 left-10 z-50">
      {show && (
        <div className="w-72 bg-white shadow-xl rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-blue-800 text-white px-4 py-3 flex items-center justify-between">
            <span className="font-semibold">Accessibility Tools</span>
            <X
              onClick={onClose}
              className="cursor-pointer hover:scale-110 transition-transform"
            />
          </div>
          <div className="p-4 space-y-3 text-sm">
            <button
              onClick={toggleLargeText}
              className="w-full bg-gray-100 hover:bg-gray-200 py-2 rounded text-gray-800 font-medium transition"
            >
              🔍 {isLargeText ? 'Normal Text Size' : 'Increase Text Size'}
            </button>
            <button
              onClick={toggleHighContrast}
              className="w-full bg-gray-100 hover:bg-gray-200 py-2 rounded text-gray-800 font-medium transition"
            >
              🌗 {isHighContrast ? 'Normal Mode' : 'High Contrast'}
            </button>
            <button
              onClick={toggleScreenReader}
              className="w-full bg-gray-100 hover:bg-gray-200 py-2 rounded text-gray-800 font-medium transition"
            >
              🗣️ {screenReaderMode ? 'Disable Reader Mode' : 'Screen Reader Mode'}
            </button>
            <button
              onClick={toggleDyslexicFont}
              className="w-full bg-gray-100 hover:bg-gray-200 py-2 rounded text-gray-800 font-medium transition"
            >
              🧠 {dyslexicFont ? 'Default Font' : 'Dyslexia-Friendly Font'}
            </button>
          </div>
        </div>
      )}

      <button
        onClick={onToggle}
        className="bg-blue-700 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform"
        aria-label="Toggle Accessibility"
      >
        <Accessibility />
      </button>
    </div>
  );
};

export default AccessibilityWidget;
