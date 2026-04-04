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

const generateRoadmap = async (req, res) => {
  try {
    const { target, currentLevel, timeframe } = req.body;
    
    const roadmapPrompt = `Create a detailed learning roadmap for ${target} for a ${currentLevel} learner who wants to achieve this in ${timeframe}. Include:
1. Key topics to learn in order
2. Suggested resources (books, courses, tutorials)
3. Practical projects to build
4. Milestones and checkpoints
5. Estimated time for each phase`;

    const response = await axios.post(
      'https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf',
      {
        inputs: roadmapPrompt,
        parameters: {
          max_new_tokens: 800,
          temperature: 0.7
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const roadmap = response.data[0]?.generated_text || 
      'Unable to generate roadmap. Please try again.';

    res.json({
      success: true,
      roadmap
    });
  } catch (error) {
    console.error('Roadmap generation error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to generate roadmap'
    });
  }
};

const generateCV = async (req, res) => {
  try {
    const { personalInfo, education, experience, skills } = req.body;
    
    const cvPrompt = `Create a professional CV/resume with the following information:

PERSONAL INFO:
- Name: ${personalInfo?.name || 'N/A'}
- Email: ${personalInfo?.email || 'N/A'}
- Phone: ${personalInfo?.phone || 'N/A'}
- Location: ${personalInfo?.location || 'N/A'}

EDUCATION:
${education?.map(e => `- ${e.degree} at ${e.institution} (${e.year})`).join('\n') || 'N/A'}

EXPERIENCE:
${experience?.map(e => `- ${e.title} at ${e.company} (${e.period}): ${e.description}`).join('\n') || 'N/A'}

SKILLS:
${skills?.join(', ') || 'N/A'}

Please format this as a clean, professional CV with clear sections and bullet points.`;

    const response = await axios.post(
      'https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf',
      {
        inputs: cvPrompt,
        parameters: {
          max_new_tokens: 1000,
          temperature: 0.7
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const cv = response.data[0]?.generated_text || 
      'Unable to generate CV. Please try again.';

    res.json({
      success: true,
      cv
    });
  } catch (error) {
    console.error('CV generation error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to generate CV'
    });
  }
};

module.exports = { chatWithAI, generateRoadmap, generateCV };