import React, { useState, useEffect } from 'react';
import { courseService, assignmentService } from '../services/api';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [activeTab, setActiveTab] = useState('courses');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [courseData, assignData] = await Promise.all([
          courseService.getAll(),
          assignmentService.getAll()
        ]);
        setCourses(courseData || []);
        setAssignments(assignData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'var(--warning-color)',
      submitted: 'var(--success-color)',
      graded: 'var(--primary-color)',
      late: 'var(--danger-color)'
    };
    return colors[status] || 'var(--text-secondary)';
  };

  return (
    <div className="courses-page">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">My Courses & Assignments</h3>
        </div>

        <div className="tab-container">
          <button className={`tab ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => setActiveTab('courses')}>
            Courses ({courses.length})
          </button>
          <button className={`tab ${activeTab === 'assignments' ? 'active' : ''}`} onClick={() => setActiveTab('assignments')}>
            Assignments ({assignments.length})
          </button>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : activeTab === 'courses' ? (
          courses.length > 0 ? (
            <div className="grid">
              {courses.map((course, idx) => (
                <div key={idx} className="course-card">
                  <span className="course-code">{course.code}</span>
                  <h3 style={{ marginTop: '10px', marginBottom: '10px' }}>{course.name}</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                    {course.instructor && `Instructor: ${course.instructor}`}
                  </p>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    Credits: {course.credits || '-'} | Year: {course.year || '-'}
                  </p>
                  {course.materials && course.materials.length > 0 && (
                    <div style={{ marginTop: '15px' }}>
                      <p style={{ fontSize: '13px', fontWeight: '600' }}>📚 Materials ({course.materials.length})</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No courses enrolled</div>
          )
        ) : (
          assignments.length > 0 ? (
            <div>
              {assignments.map((assign, idx) => (
                <div key={idx} className="announcement-card">
                  <div className="announcement-title">{assign.title}</div>
                  <p style={{ marginTop: '5px', fontSize: '14px' }}>{assign.description}</p>
                  <div className="announcement-meta" style={{ marginTop: '10px' }}>
                    <span style={{ marginRight: '15px' }}>📚 {assign.courseName}</span>
                    <span style={{ marginRight: '15px' }}>📅 Due: {formatDate(assign.dueDate)}</span>
                    <span style={{ color: getStatusColor(assign.status), fontWeight: '600' }}>
                      {assign.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No assignments</div>
          )
        )}
      </div>
    </div>
  );
};

export default Courses;
