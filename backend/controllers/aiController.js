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
        error: 'AI model is loading. Please try again in few seconds.',
        retry: true 
      });
    }

    res.status(500).json({ 
      error: 'Failed to get AI response. Please try again.',
      success: false 
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