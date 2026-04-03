import React, { useState, useEffect } from 'react';
import { scheduleService } from '../services/api';

const Schedule = () => {
  const [schedule, setSchedule] = useState([]);
  const [selectedDay, setSelectedDay] = useState('monday');
  const [loading, setLoading] = useState(true);

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      try {
        const data = await scheduleService.getAll({ day: selectedDay });
        setSchedule(data || []);
      } catch (error) {
        console.error('Error fetching schedule:', error);
      }
      setLoading(false);
    };
    fetchSchedule();
  }, [selectedDay]);

  const formatTime = (time) => time || '';

  return (
    <div className="schedule-page">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Weekly Class Schedule</h3>
        </div>

        <div className="tab-container">
          {days.map(day => (
            <button
              key={day}
              className={`tab ${selectedDay === day ? 'active' : ''}`}
              onClick={() => setSelectedDay(day)}
            >
              {day.charAt(0).toUpperCase() + day.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : schedule.length > 0 ? (
          <table className="schedule-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Course</th>
                <th>Code</th>
                <th>Instructor</th>
                <th>Room</th>
                <th>Building</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((sched, idx) => (
                <tr key={idx}>
                  <td>{formatTime(sched.startTime)} - {formatTime(sched.endTime)}</td>
                  <td>{sched.courseName}</td>
                  <td>{sched.courseCode || '-'}</td>
                  <td>{sched.instructor || '-'}</td>
                  <td>{sched.room || 'TBA'}</td>
                  <td>{sched.building || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">No classes scheduled for {selectedDay}</div>
        )}
      </div>
    </div>
  );
};

export default Schedule;
