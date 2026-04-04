import React from 'react';

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <p>© {new Date().getFullYear()} SmartBDU. All rights reserved.</p>
        <p>Designed for students, lecturers, and administrators at BDU.</p>
      </div>
    </footer>
  );
};

export default Footer;
