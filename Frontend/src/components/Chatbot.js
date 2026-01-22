import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { sendMessageToChatbot } from '../services/chatbotService';
import { useNavigate } from 'react-router-dom';
import './Chatbot.css'; // We'll create this for styling

const Chatbot = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: t('chatbot.welcome', 'Hello! How can I help you today?'), sender: 'bot' }
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
      const botResponse = await sendMessageToChatbot(messageText, messages.map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text })));
      setMessages(prev => [...prev, { text: botResponse.message, sender: 'bot' }]);

      // Handle actions
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
        className="chatbot-icon"
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 13.54 2.36 15.01 3 16.34V21L7.34 19C8.67 19.64 10.14 20 12 20C17.52 20 22 15.52 22 10C22 4.48 17.52 2 12 2ZM13 14H11V12H13V14ZM13 10H11V6H13V10Z" fill="white"/>
        </svg>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="chatbot-modal"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="chatbot-header">
              <h3>{t('chatbot.title', 'SLPA Chat Assistant')}</h3>
              <button onClick={() => setIsOpen(false)} className="close-btn">×</button>
            </div>
            <div className="chatbot-messages">
              {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.sender}`}>
                  <p>{msg.text}</p>
                </div>
              ))}
              {isTyping && (
                <div className="message bot typing">
                  <p>{t('chatbot.typing', 'Typing...')}</p>
                </div>
              )}
              {/* Quick Action Buttons */}
              {messages.length === 1 && (
                <div className="quick-actions">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      className="quick-action-btn"
                      onClick={() => handleQuickAction(action.message)}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="chatbot-input">
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


export default Chatbot;
