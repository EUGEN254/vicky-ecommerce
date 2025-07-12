import React, { useContext, useState } from 'react';
import { AppContent } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiSend } from 'react-icons/fi';

const ContactUs = () => {
  const { backendUrl } = useContext(AppContent);
  const [names, setNames] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(
        backendUrl + '/api/messages/send-query',
        { names, email, description },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success(data.message || "Message sent! We will respond shortly.");
        setNames('');
        setEmail('');
        setDescription('');
      } else {
        toast.error(data.message || "Your message was not sent. Please try again.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Something went wrong");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 mt-10 md:mt-20">
      <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">Contact Us</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="names" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              id="names"
              value={names}
              onChange={(e) => setNames(e.target.value)}
              placeholder="Your Name"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Your Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Your Message
            </label>
            <textarea
              id="message"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="How can we help you?"
              rows="5"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <button
            type="submit"
            disabled={isSending}
            className={`w-full flex items-center justify-center px-6 py-3 rounded-lg font-medium ${
              isSending
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white transition-colors`}
          >
            {isSending ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Sending...
              </>
            ) : (
              <>
                <FiSend className="mr-2" />
                Send Message
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactUs;