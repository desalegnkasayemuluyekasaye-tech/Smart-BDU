import React, { useState, useEffect } from 'react';
import { announcementService, scheduleService, assignmentService } from '../services/api';

const Dashboard = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = days[new Date().getDay()];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [annData, schedData, assignData] = await Promise.all([
          announcementService.getAll({ limit: 5 }),
          scheduleService.getAll({ day: today }),
          assignmentService.getUpcoming()
        ]);
        setAnnouncements(annData.announcements || annData || []);
        setTodaySchedule(schedData || []);
        setUpcomingAssignments(assignData || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
      setLoading(false);
    };
    fetchData();
  }, [today]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (time) => {
    return time || '';
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div>
            <div className="stat-value">{todaySchedule.length}</div>
            <div className="stat-label">Classes Today</div>
          </div>
        </div>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)' }}>
          <div className="stat-icon">📢</div>
          <div>
            <div className="stat-value">{announcements.length}</div>
            <div className="stat-label">Announcements</div>
          </div>
        </div>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)' }}>
          <div className="stat-icon">📝</div>
          <div>
            <div className="stat-value">{upcomingAssignments.length}</div>
            <div className="stat-label">Pending Assignments</div>
          </div>
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Today's Schedule</h3>
          </div>
          {todaySchedule.length > 0 ? (
            <table className="schedule-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Course</th>
                  <th>Room</th>
                </tr>
              </thead>
              <tbody>
                {todaySchedule.map((sched, idx) => (
                  <tr key={idx}>
                    <td>{formatTime(sched.startTime)} - {formatTime(sched.endTime)}</td>
                    <td>{sched.courseName}</td>
                    <td>{sched.room || 'TBA'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">No classes scheduled for today</div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Upcoming Assignments</h3>
          </div>
          {upcomingAssignments.length > 0 ? (
            <div>
              {upcomingAssignments.map((assign, idx) => (
                <div key={idx} className="announcement-card">
                  <div className="announcement-title">{assign.title}</div>
                  <div className="announcement-meta">
                    {assign.courseName} • Due: {formatDate(assign.dueDate)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No upcoming assignments</div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <div className="card-header">
          <h3 className="card-title">Recent Announcements</h3>
        </div>
        {announcements.length > 0 ? (
          <div>
            {announcements.map((ann, idx) => (
              <div key={idx} className={`announcement-card ${ann.priority}`}>
                <div className="announcement-title">{ann.title}</div>
                <p style={{ marginTop: '5px', fontSize: '14px' }}>{ann.content}</p>
                <div className="announcement-meta">
                  {ann.category} • {formatDate(ann.createdAt)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">No announcements</div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
