import React, { useState, useEffect } from 'react';
import { directoryService } from '../services/api';

const Directory = () => {
  const [directory, setDirectory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  const roles = ['all', 'student', 'faculty', 'staff', 'admin'];

  useEffect(() => {
    const fetchDirectory = async () => {
      setLoading(true);
      try {
        const query = {};
        if (selectedRole !== 'all') query.role = selectedRole;
        if (search) query.search = search;
        const data = await directoryService.getAll(query);
        setDirectory(data || []);
      } catch (error) {
        console.error('Error fetching directory:', error);
      }
      setLoading(false);
    };
    const debounce = setTimeout(fetchDirectory, 300);
    return () => clearTimeout(debounce);
  }, [selectedRole, search]);

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
  };

  const getAvatarColor = (role) => {
    const colors = {
      student: 'var(--secondary-color)',
      faculty: 'var(--primary-color)',
      staff: 'var(--accent-color)',
      admin: 'var(--danger-color)'
    };
    return colors[role] || 'var(--secondary-color)';
  };

  return (
    <div className="directory-page">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Student & Faculty Directory</h3>
        </div>

        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, department, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: '200px' }}
          />
          <select
            className="form-control"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            style={{ width: '150px' }}
          >
            {roles.map(role => (
              <option key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : directory.length > 0 ? (
          <div>
            {directory.map((person, idx) => (
              <div key={idx} className="directory-card">
                <div className="directory-avatar" style={{ backgroundColor: getAvatarColor(person.role) }}>
                  {getInitials(person.name)}
                </div>
                <div className="directory-info">
                  <h4>{person.name}</h4>
                  <p>
                    {person.position && `${person.position} • `}
                    {person.department && `${person.department} • `}
                    {person.studentId && `ID: ${person.studentId}`}
                  </p>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '5px' }}>
                    {person.email && <span style={{ marginRight: '15px' }}>📧 {person.email}</span>}
                    {person.phone && <span>📞 {person.phone}</span>}
                    {person.office && <span style={{ marginLeft: '15px' }}>🏢 {person.office}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">No contacts found</div>
        )}
      </div>
    </div>
  );
};

export default Directory;
