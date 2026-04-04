import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { aiService } from '../services/api';
import './FloatingAI.css';

const FloatingAI = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I\'m your SmartBDU AI Assistant 🤖\n\nI can help you with:\n📚 Academic questions\n📅 Class schedules\n📝 Assignment information\n❓ Campus services\n\nHow can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const history = messages.slice(-8).map(msg => ({
        role: msg.role === 'ai' ? 'assistant' : msg.role,
        content: msg.content
      }));
      
      const userData = user ? {
        name: user.name,
        role: user.role || 'student',
        department: user.department,
        year: user.year
      } : null;
      
      const result = await aiService.chat(userMessage, history, userData);
      
      if (result.response) {
        setMessages(prev => [...prev, { role: 'ai', content: result.response }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', content: 'I\'m sorry, I couldn\'t process that. Please try again.' }]);
      }
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, { role: 'ai', content: 'Connection error. Please check if the server is running and try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickQuestion = (q) => {
    setInput(q);
    setIsOpen(true);
  };

  const quickQuestions = [
    'What is my schedule today?',
    'Show my pending assignments',
    'Where is the library?',
    'Contact my advisor'
  ];

  return (
    <>
      <button className="floating-ai-btn" onClick={() => setIsOpen(true)}>
        <span className="ai-icon">🤖</span>
        <span className="ai-label">AI Help</span>
      </button>

      {isOpen && (
        <div className="floating-ai-popup">
          <div className="ai-popup-header">
            <div className="ai-header-title">
              <span className="ai-icon-small">🤖</span>
              <span>SmartBDU AI</span>
            </div>
            <button className="ai-close-btn" onClick={() => setIsOpen(false)}>×</button>
          </div>

          <div className="ai-popup-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`ai-msg ${msg.role}`}>
                <div className="ai-msg-bubble">{msg.content}</div>
              </div>
            ))}
            {loading && (
              <div className="ai-msg ai">
                <div className="ai-msg-bubble">
                  <div className="ai-spinner"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="ai-quick-questions">
            {quickQuestions.map((q, idx) => (
              <button key={idx} className="ai-quick-btn" onClick={() => handleQuickQuestion(q)}>
                {q}
              </button>
            ))}
          </div>

          <div className="ai-popup-input">
            <input
              type="text"
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
            <button onClick={handleSend} disabled={loading || !input.trim()}>➤</button>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingAI;
