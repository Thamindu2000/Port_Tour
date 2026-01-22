import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { sendMessageToChatbot } from '../services/chatbotService';
import { useNavigate } from 'react-router-dom';
import './SmartChatbot.css'; // Import the CSS file

const SmartChatbot = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: t('chatbot.welcome', 'Hello! How can I help you today?'), sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle sending messages
  const handleSend = async (messageText = input) => {
    if (!messageText.trim()) return;

    // Add user message to chat
    const userMessage = { text: messageText, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Send message to backend and get response
      const botResponse = await sendMessageToChatbot(messageText, messages.map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text })));
      setMessages(prev => [...prev, { text: botResponse.message, sender: 'bot' }]);

      // Handle navigation actions
      if (botResponse.action === 'navigate') {
        setTimeout(() => {
          navigate(botResponse.path);
          setIsOpen(false);
        }, 2000);
      }
    } catch (error) {
      setMessages(prev => [...prev, { text: t('chatbot.error', 'Sorry, something went wrong. Please try again.'), sender: 'bot' }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  // Quick action buttons for common queries
  const quickActions = [
    { label: 'Make a Booking', message: 'I want to make a booking' },
    { label: 'View Schedule', message: 'Show me my schedule' },
    { label: 'Contact SLPA', message: 'Contact information' },
    { label: 'Help', message: 'Help' }
  ];

  // Handle quick action button clicks
  const handleQuickAction = (message) => {
    handleSend(message);
  };

  return (
    <>
      {/* Floating Chatbot Icon - Animated and positioned at bottom-right */}
      <motion.div
        className="smart-chatbot-icon"
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{
          y: [0, -10, 0], // Floating animation
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Chat icon SVG */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 13.54 2.36 15.01 3 16.34V21L7.34 19C8.67 19.64 10.14 20 12 20C17.52 20 22 15.52 22 10C22 4.48 17.52 2 12 2ZM13 14H11V12H13V14ZM13 10H11V6H13V10Z" fill="white"/>
        </svg>
      </motion.div>

      {/* Chat Window Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="smart-chatbot-modal"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header with title and close button */}
            <div className="smart-chatbot-header">
              <h3>{t('chatbot.title', 'SLPA Chat Assistant')}</h3>
              <button onClick={() => setIsOpen(false)} className="smart-close-btn">×</button>
            </div>

            {/* Messages container */}
            <div className="smart-chatbot-messages">
              {/* Render each message */}
              {messages.map((msg, index) => (
                <div key={index} className={`smart-message ${msg.sender}`}>
                  <p>{msg.text}</p>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="smart-message bot typing">
                  <p>{t('chatbot.typing', 'Typing...')}</p>
                </div>
              )}

              {/* Quick action buttons - shown only on initial load */}
              {messages.length === 1 && (
                <div className="smart-quick-actions">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      className="smart-quick-action-btn"
                      onClick={() => handleQuickAction(action.message)}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Reference for auto-scrolling */}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="smart-chatbot-input">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={t('chatbot.placeholder', 'Type your message...')}
                disabled={isTyping}
              />
              <button onClick={() => handleSend()} disabled={isTyping || !input.trim()}>
                {t('chatbot.send', 'Send')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SmartChatbot;
