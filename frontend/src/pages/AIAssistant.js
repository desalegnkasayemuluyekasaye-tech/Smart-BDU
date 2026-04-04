import React, { useState, useRef, useEffect } from 'react';
import { aiService } from '../services/api';

const AIAssistant = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I\'m your SmartBDU AI Assistant. I can help you with:\n\n📚 Academic questions\n🗺️ Learning roadmaps\n📄 CV generation\n🏫 Campus services\n\nHow can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  const [roadmapData, setRoadmapData] = useState({
    target: '',
    currentLevel: 'beginner',
    timeframe: '6 months'
  });
  const [roadmapResult, setRoadmapResult] = useState('');
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  
  const [cvData, setCvData] = useState({
    personalInfo: { name: '', email: '', phone: '', location: '' },
    education: [{ degree: '', institution: '', year: '' }],
    experience: [{ title: '', company: '', period: '', description: '' }],
    skills: ''
  });
  const [cvResult, setCvResult] = useState('');
  const [cvLoading, setCvLoading] = useState(false);

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

  const handleGenerateRoadmap = async () => {
    if (!roadmapData.target) {
      alert('Please enter a learning goal');
      return;
    }
    setRoadmapLoading(true);
    try {
      const result = await aiService.generateRoadmap(roadmapData);
      if (result.success) {
        setRoadmapResult(result.roadmap);
      } else {
        alert('Failed to generate roadmap: ' + result.error);
      }
    } catch (error) {
      alert('Error generating roadmap');
    } finally {
      setRoadmapLoading(false);
    }
  };

  const handleAddEducation = () => {
    setCvData({
      ...cvData,
      education: [...cvData.education, { degree: '', institution: '', year: '' }]
    });
  };

  const handleAddExperience = () => {
    setCvData({
      ...cvData,
      experience: [...cvData.experience, { title: '', company: '', period: '', description: '' }]
    });
  };

  const handleGenerateCV = async () => {
    if (!cvData.personalInfo.name || !cvData.personalInfo.email) {
      alert('Please fill in your name and email');
      return;
    }
    setCvLoading(true);
    try {
      const skillsArray = cvData.skills.split(',').map(s => s.trim()).filter(s => s);
      const result = await aiService.generateCV({
        ...cvData,
        skills: skillsArray
      });
      if (result.success) {
        setCvResult(result.cv);
      } else {
        alert('Failed to generate CV: ' + result.error);
      }
    } catch (error) {
      alert('Error generating CV');
    } finally {
      setCvLoading(false);
    }
  };

  return (
    <div className="ai-assistant-page">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">🤖 SmartBDU AI Assistant</h3>
          <div className="ai-tabs">
            <button className={`ai-tab ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>💬 Chat</button>
            <button className={`ai-tab ${activeTab === 'roadmap' ? 'active' : ''}`} onClick={() => setActiveTab('roadmap')}>🗺️ Roadmap</button>
            <button className={`ai-tab ${activeTab === 'cv' ? 'active' : ''}`} onClick={() => setActiveTab('cv')}>📄 Generate CV</button>
          </div>
        </div>

        {activeTab === 'chat' && (
          <>
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
                  placeholder="Ask me anything about campus, courses, or any academic question..."
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
          </>
        )}

        {activeTab === 'roadmap' && (
          <div className="ai-feature-form">
            <div className="form-section">
              <h4>🎯 Generate Learning Roadmap</h4>
              <p>Get a personalized learning path for your career or skill development goals.</p>
              
              <div className="form-group">
                <label>What do you want to learn?</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., Machine Learning, Web Development, Data Science"
                  value={roadmapData.target}
                  onChange={(e) => setRoadmapData({...roadmapData, target: e.target.value})}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Current Level</label>
                  <select
                    className="form-control"
                    value={roadmapData.currentLevel}
                    onChange={(e) => setRoadmapData({...roadmapData, currentLevel: e.target.value})}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Timeframe</label>
                  <select
                    className="form-control"
                    value={roadmapData.timeframe}
                    onChange={(e) => setRoadmapData({...roadmapData, timeframe: e.target.value})}
                  >
                    <option value="3 months">3 months</option>
                    <option value="6 months">6 months</option>
                    <option value="1 year">1 year</option>
                    <option value="2 years">2 years</option>
                  </select>
                </div>
              </div>

              <button 
                className="btn btn-primary" 
                onClick={handleGenerateRoadmap}
                disabled={roadmapLoading}
              >
                {roadmapLoading ? 'Generating...' : 'Generate Roadmap'}
              </button>

              {roadmapResult && (
                <div className="result-box">
                  <h4>Your Learning Roadmap</h4>
                  <pre className="result-content">{roadmapResult}</pre>
                  <button className="btn btn-secondary" onClick={() => navigator.clipboard.writeText(roadmapResult)}>
                    📋 Copy to Clipboard
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'cv' && (
          <div className="ai-feature-form">
            <div className="form-section">
              <h4>📄 Generate Professional CV</h4>
              <p>Create a polished resume tailored to your career goals.</p>
              
              <div className="cv-form-section">
                <h5>Personal Information</h5>
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Your full name"
                      value={cvData.personalInfo.name}
                      onChange={(e) => setCvData({
                        ...cvData,
                        personalInfo: {...cvData.personalInfo, name: e.target.value}
                      })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="your.email@example.com"
                      value={cvData.personalInfo.email}
                      onChange={(e) => setCvData({
                        ...cvData,
                        personalInfo: {...cvData.personalInfo, email: e.target.value}
                      })}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="+251 9XX XXX XXX"
                      value={cvData.personalInfo.phone}
                      onChange={(e) => setCvData({
                        ...cvData,
                        personalInfo: {...cvData.personalInfo, phone: e.target.value}
                      })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Location</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Bahir Dar, Ethiopia"
                      value={cvData.personalInfo.location}
                      onChange={(e) => setCvData({
                        ...cvData,
                        personalInfo: {...cvData.personalInfo, location: e.target.value}
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="cv-form-section">
                <h5>Education</h5>
                {cvData.education.map((edu, idx) => (
                  <div key={idx} className="form-row">
                    <div className="form-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Degree (e.g., BSc Computer Science)"
                        value={edu.degree}
                        onChange={(e) => {
                          const newEdu = [...cvData.education];
                          newEdu[idx].degree = e.target.value;
                          setCvData({...cvData, education: newEdu});
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Institution"
                        value={edu.institution}
                        onChange={(e) => {
                          const newEdu = [...cvData.education];
                          newEdu[idx].institution = e.target.value;
                          setCvData({...cvData, education: newEdu});
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Year"
                        value={edu.year}
                        onChange={(e) => {
                          const newEdu = [...cvData.education];
                          newEdu[idx].year = e.target.value;
                          setCvData({...cvData, education: newEdu});
                        }}
                      />
                    </div>
                  </div>
                ))}
                <button className="btn btn-secondary btn-sm" onClick={handleAddEducation}>+ Add Education</button>
              </div>

              <div className="cv-form-section">
                <h5>Work Experience</h5>
                {cvData.experience.map((exp, idx) => (
                  <div key={idx} className="experience-item">
                    <div className="form-row">
                      <div className="form-group">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Job Title"
                          value={exp.title}
                          onChange={(e) => {
                            const newExp = [...cvData.experience];
                            newExp[idx].title = e.target.value;
                            setCvData({...cvData, experience: newExp});
                          }}
                        />
                      </div>
                      <div className="form-group">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Company"
                          value={exp.company}
                          onChange={(e) => {
                            const newExp = [...cvData.experience];
                            newExp[idx].company = e.target.value;
                            setCvData({...cvData, experience: newExp});
                          }}
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Period (e.g., 2020-2022)"
                          value={exp.period}
                          onChange={(e) => {
                            const newExp = [...cvData.experience];
                            newExp[idx].period = e.target.value;
                            setCvData({...cvData, experience: newExp});
                          }}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <textarea
                        className="form-control"
                        placeholder="Description of your responsibilities"
                        value={exp.description}
                        onChange={(e) => {
                          const newExp = [...cvData.experience];
                          newExp[idx].description = e.target.value;
                          setCvData({...cvData, experience: newExp});
                        }}
                        rows="2"
                      />
                    </div>
                  </div>
                ))}
                <button className="btn btn-secondary btn-sm" onClick={handleAddExperience}>+ Add Experience</button>
              </div>

              <div className="cv-form-section">
                <h5>Skills</h5>
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="List your skills (comma separated)"
                    value={cvData.skills}
                    onChange={(e) => setCvData({...cvData, skills: e.target.value})}
                  />
                  <small>Example: JavaScript, React, Python, Node.js, MongoDB</small>
                </div>
              </div>

              <button 
                className="btn btn-primary" 
                onClick={handleGenerateCV}
                disabled={cvLoading}
              >
                {cvLoading ? 'Generating...' : 'Generate CV'}
              </button>

              {cvResult && (
                <div className="result-box">
                  <h4>Your CV</h4>
                  <pre className="result-content">{cvResult}</pre>
                  <button className="btn btn-secondary" onClick={() => navigator.clipboard.writeText(cvResult)}>
                    📋 Copy to Clipboard
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistant;