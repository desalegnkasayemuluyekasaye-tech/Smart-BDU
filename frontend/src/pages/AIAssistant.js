import React, { useState, useRef, useEffect } from 'react';
import { aiService } from '../services/api';

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I\'m your SmartBDU AI Assistant powered by Hugging Face. I can help you with:\n\n📚 Academic questions\n📅 Class schedules\n📝 Assignment information\n🏫 Campus services\n❓ General questions\n\nHow can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
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
        setMessages(prev => [...prev, { 
          role: 'ai', 
          content: result.error || 'Sorry, I couldn\'t process that. Please try again.' 
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: 'Connection error. Please check if the server is running.' 
      }]);
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

  return (
    <div className="ai-assistant-page">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">🤖 AI Academic Assistant</h3>
        </div>

        <div className="ai-chat-container">
          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.role}`}>
                <div className="message-bubble">
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="chat-message ai">
                <div className="message-bubble">
                  <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-container">
            <input
              type="text"
              className="chat-input"
              placeholder="Ask me anything about campus..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
            <button className="send-btn" onClick={handleSend} disabled={loading || !input.trim()}>
              Send
            </button>
          </div>
        </div>

        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <h4 style={{ marginBottom: '10px' }}>💡 Quick Questions</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {['When is my next class?', 'What\'s for lunch?', 'Where is the library?', 'How do I contact my advisor?', 'Help'].map((q, idx) => (
              <button
                key={idx}
                className="btn btn-secondary"
                style={{ fontSize: '12px', padding: '8px 12px' }}
                onClick={() => { setInput(q); }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
