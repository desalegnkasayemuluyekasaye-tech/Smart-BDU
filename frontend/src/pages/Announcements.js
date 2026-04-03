import React, { useState, useEffect } from 'react';
import { announcementService } from '../services/api';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'general', 'academic', 'event', 'urgent'];

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true);
      try {
        const query = selectedCategory !== 'all' ? { category: selectedCategory } : {};
        const data = await announcementService.getAll(query);
        setAnnouncements(data.announcements || data || []);
      } catch (error) {
        console.error('Error fetching announcements:', error);
      }
      setLoading(false);
    };
    fetchAnnouncements();
  }, [selectedCategory]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      urgent: 'danger',
      important: 'warning',
      normal: '',
      general: '',
      academic: '',
      event: ''
    };
    return colors[category] || '';
  };

  return (
    <div className="announcements-page">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">University Announcements</h3>
        </div>

        <div className="tab-container">
          {categories.map(cat => (
            <button
              key={cat}
              className={`tab ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : announcements.length > 0 ? (
          <div>
            {announcements.map((ann, idx) => (
              <div key={idx} className={`announcement-card ${getCategoryColor(ann.priority)}`}>
                <div className="announcement-title">{ann.title}</div>
                <p style={{ marginTop: '10px', fontSize: '14px' }}>{ann.content}</p>
                <div className="announcement-meta" style={{ marginTop: '10px' }}>
                  <span style={{ marginRight: '15px' }}>📂 {ann.category}</span>
                  <span>📅 {formatDate(ann.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">No announcements found</div>
        )}
      </div>
    </div>
  );
};

export default Announcements;
