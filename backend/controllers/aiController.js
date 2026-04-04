const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

const SYSTEM_PROMPT = `You are an AI assistant for Bahir Dar University (BDU). Your role is to help students, staff, and users by answering questions related to BDU campus life, departments, admissions, registration, courses, schedules, academic rules, facilities, and general university guidance.

Instructions:
- Always respond in a clear, friendly, and helpful tone.
- Keep answers concise but informative.
- If the user asks about BDU-specific topics, provide structured and practical guidance.
- If you are unsure about a specific answer, say that you do not have exact information and suggest what the user should do next.
- Avoid giving incorrect or fabricated official policies.
- You may explain general university concepts if BDU-specific data is not available.
- Encourage students and guide them step by step when needed.
- Support conversational chat like a help assistant.
You are embedded inside SmartBDU. Always stay focused on being a campus assistant for BDU.`;

// ── Gemini ────────────────────────────────────────────────────────────────────
async function askGemini(message, history, systemContext) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('No GEMINI_API_KEY');

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const geminiHistory = [
    { role: 'user',  parts: [{ text: systemContext }] },
    { role: 'model', parts: [{ text: 'Understood! I am SmartBDU AI, your BDU campus assistant. Ready to help.' }] },
  ];

  for (const h of (history || []).slice(-10)) {
    if (!h.content?.trim()) continue;
    geminiHistory.push({
      role: h.role === 'assistant' || h.role === 'ai' ? 'model' : 'user',
      parts: [{ text: h.content }],
    });
  }

  const chat = model.startChat({
    history: geminiHistory,
    generationConfig: { maxOutputTokens: 600, temperature: 0.7 },
  });

  const result = await chat.sendMessage(message.trim());
  return result.response.text()?.trim();
}

// ── HuggingFace fallback ──────────────────────────────────────────────────────
async function askHuggingFace(message, history, systemContext) {
  const key = process.env.HUGGING_FACE_API_KEY;
  if (!key) throw new Error('No HUGGING_FACE_API_KEY');

  // Build messages array for the new router API (OpenAI-compatible)
  const messages = [{ role: 'system', content: systemContext }];
  for (const h of (history || []).slice(-8)) {
    if (!h.content?.trim()) continue;
    messages.push({
      role: h.role === 'assistant' || h.role === 'ai' ? 'assistant' : 'user',
      content: h.content,
    });
  }
  messages.push({ role: 'user', content: message });

  const res = await axios.post(
    'https://router.huggingface.co/novita/v3/openai/chat/completions',
    {
      model: 'meta-llama/llama-3.1-8b-instruct',
      messages,
      max_tokens: 500,
      temperature: 0.7,
    },
    {
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    }
  );

  const text = res.data?.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('Empty HuggingFace response');
  return text;
}

// ── Main handler ──────────────────────────────────────────────────────────────
const chatWithAI = async (req, res) => {
  try {
    const { message, history = [], userData } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ success: false, response: null, error: 'Message is required' });
    }

    let systemContext = SYSTEM_PROMPT;
    if (userData) {
      systemContext += `\n\nCurrent user: role=${userData.role || 'student'}`;
      if (userData.name)       systemContext += `, name=${userData.name}`;
      if (userData.department) systemContext += `, department=${userData.department}`;
      if (userData.year)       systemContext += `, year=${userData.year}`;
    }

    let response = null;
    let lastError = null;

    // Try HuggingFace first (Gemini quota exhausted)
    try {
      response = await askHuggingFace(message, history, systemContext);
      console.log('✅ HuggingFace responded');
    } catch (e) {
      console.warn('⚠️ HuggingFace failed:', e.message);
      lastError = e;
    }

    // Fall back to Gemini
    if (!response) {
      try {
        response = await askGemini(message, history, systemContext);
        console.log('✅ Gemini responded');
      } catch (e) {
        console.error('⚠️ Gemini also failed:', e.message);
        lastError = e;
      }
    }

    if (!response) {
      return res.status(502).json({
        success: false,
        response: null,
        error: lastError?.message || 'Both AI services failed',
      });
    }

    return res.json({ success: true, response });

  } catch (err) {
    console.error('AI chat error:', err.message);
    return res.status(500).json({ success: false, response: null, error: err.message });
  }
};

const generateRoadmap = async (req, res) => {
  try {
    const { target, currentLevel, timeframe } = req.body;
    const prompt = `Create a detailed learning roadmap for "${target}" for a ${currentLevel} learner in ${timeframe}. Include key topics, resources, projects, milestones, and time estimates.`;
    let result = null;
    try { result = await askGemini(prompt, [], SYSTEM_PROMPT); } catch (_) {}
    if (!result) result = await askHuggingFace(prompt, [], SYSTEM_PROMPT);
    return res.json({ success: true, roadmap: result });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

const generateCV = async (req, res) => {
  try {
    const { personalInfo, education, experience, skills } = req.body;
    const prompt = `Create a professional CV for:
Name: ${personalInfo?.name}, Email: ${personalInfo?.email}
Education: ${education?.map(e => `${e.degree} at ${e.institution} (${e.year})`).join(', ')}
Experience: ${experience?.map(e => `${e.title} at ${e.company}: ${e.description}`).join(', ')}
Skills: ${skills?.join(', ')}`;
    let result = null;
    try { result = await askGemini(prompt, [], SYSTEM_PROMPT); } catch (_) {}
    if (!result) result = await askHuggingFace(prompt, [], SYSTEM_PROMPT);
    return res.json({ success: true, cv: result });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { chatWithAI, generateRoadmap, generateCV };
