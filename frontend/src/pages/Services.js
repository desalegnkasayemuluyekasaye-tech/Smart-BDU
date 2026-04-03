import React, { useState, useEffect } from 'react';
import { serviceService } from '../services/api';

const Services = () => {
  const [services, setServices] = useState([]);
  const [activeService, setActiveService] = useState('cafeteria');
  const [loading, setLoading] = useState(true);

  const serviceTypes = [
    { id: 'cafeteria', name: 'Cafeteria', icon: '🍽' },
    { id: 'dormitory', name: 'Dormitory', icon: '🏠' },
    { id: 'transport', name: 'Transport', icon: '🚌' },
    { id: 'library', name: 'Library', icon: '📚' },
    { id: 'health', name: 'Health Center', icon: '🏥' }
  ];

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const data = await serviceService.getAll({ type: activeService });
        setServices(data || []);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
      setLoading(false);
    };
    fetchServices();
  }, [activeService]);

  const getCurrentMenu = (service) => {
    if (!service.menu) return null;
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[new Date().getDay()];
    return service.menu.find(m => m.day.toLowerCase() === today);
  };

  return (
    <div className="services-page">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Campus Services</h3>
        </div>

        <div className="tab-container">
          {serviceTypes.map(type => (
            <button
              key={type.id}
              className={`tab ${activeService === type.id ? 'active' : ''}`}
              onClick={() => setActiveService(type.id)}
            >
              {type.icon} {type.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : services.length > 0 ? (
          <div>
            {services.map((service, idx) => (
              <div key={idx} className="service-card">
                <div className="service-icon">
                  {serviceTypes.find(t => t.id === service.type)?.icon || '📍'}
                </div>
                <div style={{ flex: 1 }}>
                  <h3>{service.name}</h3>
                  {service.description && <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '5px' }}>{service.description}</p>}
                  
                  {service.hours && (
                    <p style={{ fontSize: '14px', marginTop: '10px' }}>🕐 Hours: {service.hours}</p>
                  )}
                  {service.location && (
                    <p style={{ fontSize: '14px' }}>📍 Location: {service.location}</p>
                  )}
                  {service.contact && (
                    <p style={{ fontSize: '14px' }}>📞 Contact: {service.contact}</p>
                  )}

                  {service.type === 'cafeteria' && service.menu && (
                    <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                      <h4 style={{ marginBottom: '10px' }}>Today's Menu</h4>
                      {(() => {
                        const menu = getCurrentMenu(service);
                        return menu ? (
                          <div>
                            <p><strong>Breakfast:</strong> {menu.breakfast?.join(', ') || 'Not available'}</p>
                            <p><strong>Lunch:</strong> {menu.lunch?.join(', ') || 'Not available'}</p>
                            <p><strong>Dinner:</strong> {menu.dinner?.join(', ') || 'Not available'}</p>
                          </div>
                        ) : <p>Menu not available</p>;
                      })()}
                    </div>
                  )}

                  {service.type === 'transport' && service.routes && (
                    <div style={{ marginTop: '15px' }}>
                      {service.routes.map((route, rIdx) => (
                        <div key={rIdx} style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
                          <h4>{route.routeName}</h4>
                          <p style={{ fontSize: '13px' }}>Schedule: {route.schedule?.join(', ')}</p>
                          <p style={{ fontSize: '13px' }}>Stops: {route.stops?.join(' → ')}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">No {activeService} services available</div>
        )}
      </div>
    </div>
  );
};

export default Services;
