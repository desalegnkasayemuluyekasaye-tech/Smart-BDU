import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { aiService } from '../services/api';
import './FloatingAI.css';

const QUICK = [
  '📋 How do I register for courses?',
  '📅 What is the academic calendar?',
  '🏛️ Where are the main departments?',
  '📝 How does grading work at BDU?',
  '🎓 What are admission requirements?',
  '📞 How do I contact my advisor?',
];

const WELCOME = `Hello! I'm your **SmartBDU AI Assistant** 🎓

I'm here to help you with everything about **Bahir Dar University** — campus life, departments, admissions, registration, courses, schedules, academic rules, and more.

How can I help you today?`;

const FloatingAI = () => {
  const { user } = useAuth();
  const [isOpen,    setIsOpen]    = useState(false);
  const [messages,  setMessages]  = useState([{ role: 'ai', content: WELCOME }]);
  const [input,     setInput]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [showQuick, setShowQuick] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');
    setShowQuick(false);
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);
    try {
      const history = messages.slice(-10).map(m => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.content,
      }));
      const userData = user ? { name: user.name, role: user.role, department: user.department, year: user.year } : null;
      const result = await aiService.chat(msg, history, userData);
      setMessages(prev => [...prev, {
        role: 'ai',
        content: result.response || `⚠️ ${result.error || "Couldn't get a response. Please try again."}`,
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: `⚠️ ${err.message || 'Connection error. Make sure the backend is running.'}` }]);
    }
    setLoading(false);
  };

  const clearChat = () => {
    setMessages([{ role: 'ai', content: WELCOME }]);
    setShowQuick(true);
  };

  // Render markdown-like bold (**text**)
  const renderContent = (text) =>
    text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
      part.startsWith('**') && part.endsWith('**')
        ? <strong key={i}>{part.slice(2, -2)}</strong>
        : part
    );

  return (
    <>
      {/* ── Floating button ── */}
      <button className={`fai-btn ${isOpen ? 'fai-btn-active' : ''}`} onClick={() => setIsOpen(v => !v)} title="AI Help">
        <span className="fai-btn-icon">{isOpen ? '✕' : '🤖'}</span>
        {!isOpen && <span className="fai-btn-label">AI Help</span>}
      </button>

      {/* ── Chat popup ── */}
      {isOpen && (
        <div className="fai-popup">
          {/* Header */}
          <div className="fai-header">
            <div className="fai-header-left">
              <div className="fai-avatar">🤖</div>
              <div>
                <div className="fai-header-name">SmartBDU AI</div>
                <div className="fai-header-status"><span className="fai-dot" />BDU Campus Assistant</div>
              </div>
            </div>
            <div className="fai-header-actions">
              <button className="fai-icon-btn" onClick={clearChat} title="Clear chat">🗑</button>
              <button className="fai-icon-btn" onClick={() => setIsOpen(false)} title="Close">✕</button>
            </div>
          </div>

          {/* Messages */}
          <div className="fai-messages">
            {messages.map((m, i) => (
              <div key={i} className={`fai-msg-row ${m.role}`}>
                {m.role === 'ai' && <div className="fai-msg-avatar">🤖</div>}
                <div className={`fai-bubble ${m.role}`}>
                  {renderContent(m.content)}
                </div>
              </div>
            ))}

            {loading && (
              <div className="fai-msg-row ai">
                <div className="fai-msg-avatar">🤖</div>
                <div className="fai-bubble ai fai-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick questions */}
          {showQuick && (
            <div className="fai-quick">
              <div className="fai-quick-label">Quick questions</div>
              <div className="fai-quick-grid">
                {QUICK.map((q, i) => (
                  <button key={i} className="fai-quick-btn" onClick={() => send(q)}>{q}</button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="fai-input-row">
            <input
              ref={inputRef}
              type="text"
              className="fai-input"
              placeholder="Ask about BDU campus, courses, admissions..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              disabled={loading}
            />
            <button
              className="fai-send-btn"
              onClick={() => send()}
              disabled={loading || !input.trim()}
              title="Send">
              {loading ? <span className="fai-send-spin" /> : '➤'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingAI;
