import { publicAPI } from './api';

export const sendMessageToChatbot = async (message, conversationHistory = []) => {
  try {
    const systemMessage = {
      role: 'system',
      content: `You are a helpful assistant for the Sri Lanka Ports Authority educational tour booking system. You can answer questions about port operations, booking tours, system usage, and general inquiries. If a user wants to make a booking, guide them to use the booking form in the app. Keep responses friendly, informative, and in the user's language if possible. Available languages: English, Sinhala, Tamil.`
    };

    const fullConversationHistory = [systemMessage, ...conversationHistory];

    const response = await publicAPI.sendChatbotMessage({
      conversationHistory: fullConversationHistory
    });

    return response.data;
  } catch (error) {
    console.error('Error calling chatbot API:', error.response ? error.response.data : error.message);
    return 'Sorry, I am unable to respond right now. Please try again later.';
  }
};
