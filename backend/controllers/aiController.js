const axios = require('axios');

const chatWithAI = async (req, res) => {
  try {
    const { message, history, userData } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    let userContext = '';
    if (userData) {
      userContext = `You are a helpful academic assistant for Bahir Dar University. The user is a ${userData.role || 'student'}. `;
      if (userData.name) userContext += `User name: ${userData.name}. `;
      if (userData.department) userContext += `Department: ${userData.department}. `;
      if (userData.year) userContext += `Year: ${userData.year}. `;
      userContext += 'Keep answers concise and helpful.\n\n';
    }

    const fullMessage = userContext + message;

    const response = await axios.post(
      'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
      { inputs: fullMessage },
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    let aiResponse = '';
    
    if (Array.isArray(response.data) && response.data[0]) {
      aiResponse = response.data[0].generated_text || '';
    } else if (response.data.generated_text) {
      aiResponse = response.data.generated_text;
    }

    if (aiResponse.includes(fullMessage)) {
      aiResponse = aiResponse.replace(fullMessage, '').trim();
    }

    if (!aiResponse || aiResponse.length < 2) {
      aiResponse = "I'm here to help! Please try asking your question differently.";
    }

    if (aiResponse.length > 400) {
      aiResponse = aiResponse.substring(0, 400) + '...';
    }

    res.json({ 
      response: aiResponse,
      success: true 
    });

  } catch (error) {
    console.error('AI Error:', error.response?.status, error.response?.data?.error || error.message);
    
    if (error.response?.status === 503) {
      return res.json({ 
        response: 'AI model is starting up. Please try again in a moment.',
        success: true 
      });
    }

    if (error.response?.data?.error) {
      return res.json({ 
        response: `I'm having trouble connecting to the AI service. Please try again.`,
        success: true 
      });
    }

    res.json({ 
      response: 'I apologize, but I\'m having trouble processing your request right now. Please try again.',
      success: true 
    });
  }
};

module.exports = { chatWithAI };
