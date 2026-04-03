const axios = require('axios');

const chatWithAI = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const conversationHistory = history 
      ? history.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        }))
      : [];

    conversationHistory.push({ role: 'user', content: message });

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
          text: message
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const aiResponse = response.data.generated_text || 
      "I'm sorry, I couldn't process that request. Please try again.";

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

module.exports = { chatWithAI };
