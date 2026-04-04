const axios = require('axios');

const DEFAULT_MODEL = 'Qwen/Qwen2.5-1.5B-Instruct';
const HF_INFERENCE_BASE = 'https://api-inference.huggingface.co/models';

/** Qwen2.5 Instruct chat format (matches HF tokenizer chat template). */
const IM_START = '<|im_start|>';
const IM_END = '<|im_end|>';

function getApiKey() {
  const k = process.env.HUGGING_FACE_API_KEY;
  return k && String(k).trim() ? String(k).trim() : null;
}

function getChatModel() {
  return (process.env.HUGGING_FACE_CHAT_MODEL || DEFAULT_MODEL).trim();
}

function buildQwenChatPrompt(systemText, history, userMessage) {
  let prompt = `${IM_START}system\n${systemText}${IM_END}\n`;
  const safeHistory = Array.isArray(history) ? history.slice(-12) : [];
  for (const h of safeHistory) {
    const role = h.role === 'assistant' ? 'assistant' : 'user';
    const content = String(h.content || '').trim();
    if (!content) continue;
    prompt += `${IM_START}${role}\n${content}${IM_END}\n`;
  }
  prompt += `${IM_START}user\n${String(userMessage).trim()}${IM_END}\n${IM_START}assistant\n`;
  return prompt;
}

function extractGeneratedText(data) {
  if (!data) return '';
  if (Array.isArray(data) && data[0] != null) {
    const first = data[0];
    if (typeof first === 'string') return first;
    if (first.generated_text != null) return String(first.generated_text);
  }
  if (data.generated_text != null) return String(data.generated_text);
  return '';
}

function cleanAssistantReply(text) {
  if (!text) return '';
  let out = text.trim();
  const cut = out.indexOf(IM_START);
  if (cut !== -1) out = out.slice(0, cut).trim();
  out = out.split(IM_END)[0].trim();
  return out;
}

async function huggingFaceTextGeneration(prompt, { max_new_tokens = 512, temperature = 0.7, model } = {}) {
  const token = getApiKey();
  if (!token) {
    const err = new Error('HUGGING_FACE_API_KEY is not set in backend .env');
    err.code = 'MISSING_KEY';
    throw err;
  }

  const modelId = model || getChatModel();
  const url = `${HF_INFERENCE_BASE}/${encodeURIComponent(modelId)}`;

  const payload = {
    inputs: prompt,
    parameters: {
      max_new_tokens,
      temperature,
      top_p: 0.9,
      do_sample: true,
      return_full_text: false,
    },
  };

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    timeout: 120000,
    validateStatus: () => true,
  };

  let res = await axios.post(url, payload, config);

  if (res.status === 503) {
    await new Promise((r) => setTimeout(r, 20000));
    res = await axios.post(url, payload, config);
  }

  if (res.status === 401 || res.status === 403) {
    const err = new Error('Invalid or unauthorized Hugging Face API key.');
    err.code = 'HF_AUTH';
    err.status = res.status;
    throw err;
  }

  if (res.status === 503) {
    const err = new Error('Model is loading or busy. Try again in a minute.');
    err.code = 'HF_503';
    err.status = 503;
    throw err;
  }

  if (res.status >= 400) {
    const msg =
      (res.data && (res.data.error || res.data.message)) ||
      `Hugging Face API error (${res.status})`;
    const err = new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    err.code = 'HF_ERROR';
    err.status = res.status;
    throw err;
  }

  const raw = extractGeneratedText(res.data);
  return cleanAssistantReply(raw);
}

const chatWithAI = async (req, res) => {
  try {
    const { message, history, userData } = req.body;

    if (!message || !String(message).trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message is required',
        response: null,
      });
    }

    if (!getApiKey()) {
      return res.status(503).json({
        success: false,
        error: 'AI is not configured. Set HUGGING_FACE_API_KEY in backend/.env and restart the server.',
        response: null,
      });
    }

    let systemText =
      'You are SmartBDU AI, a helpful assistant for Bahir Dar University (Ethiopia). ' +
      'Answer clearly and concisely. For personal schedules, grades, or assignments, tell the user to check their SmartBDU dashboard for live data. ' +
      'If you are unsure about university-specific facts, say so and suggest official university sources.';

    if (userData) {
      systemText += `\n\nUser context: role=${userData.role || 'student'}`;
      if (userData.name) systemText += `, name=${userData.name}`;
      if (userData.department) systemText += `, department=${userData.department}`;
      if (userData.year != null && userData.year !== '') systemText += `, year=${userData.year}`;
      systemText += '.';
    }

    const safeHistory = Array.isArray(history)
      ? history.map((h) => ({
          role: h.role === 'assistant' || h.role === 'ai' ? 'assistant' : 'user',
          content: h.content,
        }))
      : [];

    const prompt = buildQwenChatPrompt(systemText, safeHistory, message);
    let aiResponse = await huggingFaceTextGeneration(prompt, {
      max_new_tokens: 512,
      temperature: 0.65,
    });

    if (!aiResponse || aiResponse.length < 2) {
      aiResponse =
        "I'm here to help. Could you rephrase your question, or ask something more specific about campus or academics?";
    }

    if (aiResponse.length > 4000) {
      aiResponse = `${aiResponse.slice(0, 3997)}...`;
    }

    return res.json({
      success: true,
      response: aiResponse,
    });
  } catch (error) {
    console.error('AI chat error:', error.code || error.message, error.response?.data || '');

    if (error.code === 'MISSING_KEY') {
      return res.status(503).json({
        success: false,
        error: error.message,
        response: null,
      });
    }

    if (error.code === 'HF_503') {
      return res.status(503).json({
        success: false,
        error: error.message,
        response: null,
      });
    }

    const msg =
      error.code === 'HF_AUTH'
        ? 'Hugging Face API key is invalid. Check HUGGING_FACE_API_KEY in .env.'
        : error.message || 'Could not reach the AI service.';

    return res.status(502).json({
      success: false,
      error: msg,
      response: null,
    });
  }
};

const generateRoadmap = async (req, res) => {
  try {
    if (!getApiKey()) {
      return res.status(503).json({
        success: false,
        error: 'Set HUGGING_FACE_API_KEY in backend/.env',
      });
    }

    const { target, currentLevel, timeframe } = req.body;

    const userBlock = `Create a detailed learning roadmap for ${target} for a ${currentLevel} learner who wants to achieve this in ${timeframe}. Include:
1. Key topics to learn in order
2. Suggested resources (books, courses, tutorials)
3. Practical projects to build
4. Milestones and checkpoints
5. Estimated time for each phase`;

    const systemText =
      'You are a learning coach. Respond with structured, actionable sections. Be concise but complete.';
    const prompt = buildQwenChatPrompt(systemText, [], userBlock);

    const roadmap = await huggingFaceTextGeneration(prompt, {
      max_new_tokens: 800,
      temperature: 0.7,
    });

    return res.json({
      success: true,
      roadmap: roadmap || 'Unable to generate roadmap. Please try again.',
    });
  } catch (error) {
    console.error('Roadmap generation error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate roadmap',
    });
  }
};

const generateCV = async (req, res) => {
  try {
    if (!getApiKey()) {
      return res.status(503).json({
        success: false,
        error: 'Set HUGGING_FACE_API_KEY in backend/.env',
      });
    }

    const { personalInfo, education, experience, skills } = req.body;

    const userBlock = `Create a professional CV/resume with the following information:

PERSONAL INFO:
- Name: ${personalInfo?.name || 'N/A'}
- Email: ${personalInfo?.email || 'N/A'}
- Phone: ${personalInfo?.phone || 'N/A'}
- Location: ${personalInfo?.location || 'N/A'}

EDUCATION:
${education?.map((e) => `- ${e.degree} at ${e.institution} (${e.year})`).join('\n') || 'N/A'}

EXPERIENCE:
${experience?.map((e) => `- ${e.title} at ${e.company} (${e.period}): ${e.description}`).join('\n') || 'N/A'}

SKILLS:
${skills?.join(', ') || 'N/A'}

Format as a clean, professional CV with clear sections and bullet points.`;

    const systemText = 'You are a professional resume writer. Output only the CV text, well formatted.';
    const prompt = buildQwenChatPrompt(systemText, [], userBlock);

    const cv = await huggingFaceTextGeneration(prompt, {
      max_new_tokens: 1000,
      temperature: 0.65,
    });

    return res.json({
      success: true,
      cv: cv || 'Unable to generate CV. Please try again.',
    });
  } catch (error) {
    console.error('CV generation error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate CV',
    });
  }
};

module.exports = { chatWithAI, generateRoadmap, generateCV };
