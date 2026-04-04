const axios = require('axios');

const chatWithAI = async (req, res) => {
  try {
    const { message, history, userData } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const userContext = buildUserContext(userData);
    const fullMessage = userContext ? `${userContext}\n\nUser question: ${message}` : message;

    const conversationHistory = history 
      ? history.slice(-6).map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        }))
      : [];

    conversationHistory.push({ role: 'user', content: fullMessage });

    const response = await axios.post(
      'https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill',
      {
        inputs: {
          past_user_inputs: conversationHistory
            .filter((_, i) => i % 2 === 0)
            .map(msg => msg.content),
          generated_responses: conversationHistory
            .filter((_, i) => i % 2 === 1)
            .map(msg => msg.content),
          text: fullMessage
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    let aiResponse = response.data.generated_text || 
      "I'm sorry, I couldn't process that request. Please try again.";

    aiResponse = cleanResponse(aiResponse);

    res.json({ 
      response: aiResponse,
      success: true 
    });

  } catch (error) {
    console.error('Hugging Face API Error:', error.response?.data || error.message);
    
    if (error.response?.status === 503) {
      return res.status(503).json({ 
        error: 'AI model is loading. Please try again in a few seconds.',
        retry: true 
      });
    }

    res.status(500).json({ 
      error: 'Failed to get AI response. Please try again.',
      success: false 
    });
  }
};

const buildUserContext = (userData) => {
  if (!userData) return null;
  
  let context = `You are a helpful academic assistant for Bahir Dar University. The user is a ${userData.role} named ${userData.name}.`;
  
  if (userData.department) {
    context += ` Department: ${userData.department}.`;
  }
  if (userData.year) {
    context += ` Year: ${userData.year}.`;
  }
  
  return context;
};

const cleanResponse = (response) => {
  let cleaned = response.replace(/<pad>/g, '').trim();
  cleaned = cleaned.replace(/^.*?:/, '').trim();
  
  if (cleaned.length > 500) {
    cleaned = cleaned.substring(0, 500) + '...';
  }
  
  return cleaned || "I understand. Let me help you with that!";
};

module.exports = { chatWithAI };
