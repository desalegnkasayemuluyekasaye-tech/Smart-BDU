import React, { useState, useRef, useEffect } from 'react';
import { aiService } from '../services/api';
import './FloatingAI.css';

const FloatingAI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I\'m your SmartBDU AI Assistant. How can I help you today?' }
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
      const history = messages.map(msg => ({
        role: msg.role === 'ai' ? 'assistant' : msg.role,
        content: msg.content
      }));
      
      const result = await aiService.chat(userMessage, history);
      
      if (result.success && result.response) {
        setMessages(prev => [...prev, { role: 'ai', content: result.response }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', content: result.error || 'Sorry, I couldn\'t process that.' }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Connection error. Please check if the server is running.' }]);
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

  const quickQuestions = [
    'When is my next class?',
    'What assignments are due?',
    'Where is the library?',
    'How do I contact my advisor?'
  ];

  return (
    <>
      {/* Floating Button */}
      <button className="floating-ai-btn" onClick={() => setIsOpen(true)}>
        <span className="ai-icon">🤖</span>
        <span className="ai-label">AI Help</span>
      </button>

      {/* Chat Popup */}
      {isOpen && (
        <div className="floating-ai-popup">
          <div className="ai-popup-header">
            <div className="ai-header-title">
              <span className="ai-icon-small">🤖</span>
              <span>SmartBDU AI Assistant</span>
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
              <button key={idx} className="ai-quick-btn" onClick={() => setInput(q)}>
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
