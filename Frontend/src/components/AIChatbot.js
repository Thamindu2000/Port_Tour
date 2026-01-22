import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
// import { sendMessageToChatbot } from '../services/chatbotService'; // eslint-disable-line no-unused-vars
import { useNavigate } from 'react-router-dom';

// Advanced Intent Detection Function
const detectIntent = (message) => {
  const lowerMessage = message.toLowerCase();

  // Define intent patterns with weights
  const intents = {
    booking: {
      keywords: ['book', 'booking', 'reserve', 'appointment', 'visit', 'schedule', 'make a booking', 'reserve a visit', 'book an appointment'],
      weight: 1.0
    },
    schedule: {
      keywords: ['schedule', 'my bookings', 'view bookings', 'see my schedule', 'upcoming visits', 'my appointments'],
      weight: 1.0
    },
    contact: {
      keywords: ['contact', 'phone', 'email', 'reach', 'support', 'help', 'call', 'message', 'talk to'],
      weight: 1.0
    },
    login: {
      keywords: ['login', 'sign in', 'account', 'log in', 'authenticate', 'access my account'],
      weight: 1.0
    },
    signup: {
      keywords: ['register', 'sign up', 'create account', 'join', 'new account', 'signup'],
      weight: 1.0
    },
    user: {
      keywords: ['profile', 'user management', 'my profile', 'account settings', 'personal info'],
      weight: 1.0
    },
    help: {
      keywords: ['help', 'what can you do', 'assist', 'support', 'guide', 'how to'],
      weight: 0.8
    },
    cancel: {
      keywords: ['cancel', 'change booking', 'modify', 'update', 'reschedule', 'delete booking'],
      weight: 0.9
    }
  };

  // Calculate scores for each intent
  const scores = {};
  for (const [intent, data] of Object.entries(intents)) {
    let score = 0;
    for (const keyword of data.keywords) {
      if (lowerMessage.includes(keyword)) {
        score += data.weight;
      }
    }
    scores[intent] = score;
  }

  // Find the intent with the highest score
  const bestIntent = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);

  // Return intent if score is above threshold
  return scores[bestIntent] > 0 ? bestIntent : null;
};

// Generate smart responses based on intent
const generateResponse = (intent, message) => {
  const responses = {
    booking: [
      "Great! I'd be happy to help you make a booking. Let me take you to the booking page where you can select your preferred date and time.",
      "Perfect! Booking a visit is easy. I'll redirect you to our booking form now.",
      "Excellent choice! Let's get you booked. The booking page will guide you through the process step by step."
    ],
    schedule: [
      "Let me show you your current schedule and bookings. I'll take you to the schedule page.",
      "I'll help you view your upcoming visits. Let's check your schedule now.",
      "Your schedule is just a click away. I'll navigate you to the bookings page."
    ],
    contact: [
      "I can help you get in touch with SLPA staff. Let me take you to our contact page.",
      "Need to reach our team? I'll show you the best ways to contact SLPA.",
      "For any questions or support, our contact page has all the information you need."
    ],
    login: [
      "To access your account, you'll need to log in. Let me take you to the login page.",
      "Let's get you signed in to your account. I'll redirect you to the login page.",
      "Account access is just a moment away. I'll navigate you to the login form."
    ],
    signup: [
      "Ready to create your account? I'll take you to the registration page.",
      "Joining SLPA is easy! Let me show you the signup page.",
      "Let's get you registered. The signup page will guide you through the process."
    ],
    user: [
      "Need to manage your profile? I'll take you to your account settings.",
      "Your user profile is where you can update your information. Let me navigate you there.",
      "Account management is important. I'll show you your user profile page."
    ],
    help: [
      "I'm here to help! I can assist with bookings, schedules, contact information, and account management. What would you like to know?",
      "I can guide you through booking visits, viewing schedules, contacting staff, and managing your account. How can I assist you today?",
      "I'm your SLPA assistant. I can help with: making bookings, checking schedules, getting contact info, and account management. What do you need?"
    ],
    cancel: [
      "Need to modify or cancel a booking? Let me take you to your bookings where you can manage them.",
      "Booking changes are easy to make. I'll show you your current bookings.",
      "Let's update your booking. I'll take you to the bookings management page."
    ]
  };

  const intentResponses = responses[intent] || ["I'm not sure what you mean, but I can help you with bookings, schedules, or contact details. Which one would you like?"];

  // Return a random response from the array
  return intentResponses[Math.floor(Math.random() * intentResponses.length)];
};

// Get navigation path for intent
const getNavigationPath = (intent) => {
  const paths = {
    booking: '/booking',
    schedule: '/schedule',
    contact: '/contact',
    login: '/login',
    signup: '/signup',
    user: '/user-management',
    cancel: '/schedule'
  };
  return paths[intent];
};

const AIChatbot = () => {
  // eslint-disable-next-line no-unused-vars
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your SLPA AI assistant. How can I help you today?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (messageText = input) => {
    if (!messageText.trim()) return;

    const userMessage = { text: messageText, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Detect intent from user message
      const intent = detectIntent(messageText);

      let botResponse;
      let action = null;
      let path = null;

      if (intent) {
        // Generate smart response based on intent
        botResponse = generateResponse(intent, messageText);
        path = getNavigationPath(intent);
        action = 'navigate';
      } else {
        // Fallback response
        botResponse = "I'm not sure what you mean, but I can help you with bookings, schedules, contact details, or account management. Which one would you like?";
      }

      setMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]);

      // Handle navigation
      if (action === 'navigate' && path) {
        setTimeout(() => {
          navigate(path);
          setIsOpen(false);
        }, 2000);
      }
    } catch (error) {
      setMessages(prev => [...prev, { text: "Sorry, I'm having trouble right now. Please try again.", sender: 'bot' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  // Quick action buttons
  const quickActions = [
    { label: 'Make a Booking', message: 'I want to make a booking' },
    { label: 'View Schedule', message: 'Show me my schedule' },
    { label: 'Contact SLPA', message: 'Contact information' },
    { label: 'Help', message: 'Help' }
  ];

  const handleQuickAction = (message) => {
    handleSend(message);
  };

  return (
    <>
      {/* Floating Chatbot Icon */}
      <motion.div
        className="fixed bottom-4 right-4 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center cursor-pointer shadow-lg z-50"
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </motion.div>

      {/* Dark Backdrop Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
            style={{
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(5px)',
              WebkitBackdropFilter: 'blur(5px)'
            }}
          />
        )}
      </AnimatePresence>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-20 right-4 w-96 h-[32rem] rounded-2xl shadow-2xl flex flex-col z-50"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            style={{
              background: 'rgba(255, 255, 255, 0.11)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 2px rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
              <h3 className="text-lg font-semibold">SLPA AI Assistant</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 transition-colors text-xl"
              >
                ×
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto" style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(5px)',
              WebkitBackdropFilter: 'blur(5px)'
            }}>
              {messages.map((msg, index) => (
                <div key={index} className={`mb-4 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs px-4 py-2 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      : 'text-gray-800'
                  }`}
                  style={msg.sender === 'bot' ? {
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(5px)',
                    WebkitBackdropFilter: 'blur(5px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                  } : {}}>
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="mb-4 flex justify-start">
                  <div className="px-4 py-2 rounded-2xl" style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(5px)',
                    WebkitBackdropFilter: 'blur(5px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              {messages.length === 1 && (
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-3 py-2 rounded-lg text-xs font-medium hover:from-green-500 hover:to-blue-600 transition-all transform hover:scale-105"
                      onClick={() => handleQuickAction(action.message)}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 rounded-b-2xl" style={{
              background: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(5px)',
              WebkitBackdropFilter: 'blur(5px)',
              borderTop: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  className="flex-1 px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(5px)',
                    WebkitBackdropFilter: 'blur(5px)',
                    color: '#333'
                  }}
                  disabled={isTyping}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={isTyping || !input.trim()}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Send
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatbot;
