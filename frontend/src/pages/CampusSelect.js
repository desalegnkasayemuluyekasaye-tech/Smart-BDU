import React from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import campusMain from "../assets/campus-main.jpg";
import campusZen  from "../assets/campus-zen.jpg";
import campusTib  from "../assets/campus-tib.jpg";
import campusYib  from "../assets/campus-yib.jpg";
import polyCampus from "../assets/poly-campus-photo.png";

const campuses = [
  { id: "main",    name: "Main Campus (Peda)",  image: campusMain, active: false },
  { id: "bit",     name: "BIT / Poly Campus",   image: polyCampus, active: true },
  { id: "zen",     name: "Zenzelma Campus",      image: campusZen, active: false  },
  { id: "tibebe",  name: "Tibebe Ghion Campus",  image: campusTib, active: false  },
  { id: "yibab",   name: "Yibab Campus",         image: campusYib, active: false  },
];

const CampusSelect = () => {
  const navigate = useNavigate();

  const handleSelect = (campus) => {
    if (campus.active) {
      navigate("/login", { state: { campus } });
    } else {
      toast.info(`${campus.name} is coming soon!`, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  };

  return (
    <div className="campus-wrapper">
      <ToastContainer />
      <button className="back-to-home" onClick={() => navigate("/")} title="Back to Home">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
      </button>

      <div className="campus-card-box">
        <div className="campus-logo-wrap">
          <img src="/logo.png" alt="SmartBDU" className="campus-logo-img" />
        </div>
        <p className="campus-subtitle">Select Your Campus</p>

        <ul className="campus-list">
          {campuses.map((c) => (
            <li key={c.id}>
              <button 
                className={`campus-item ${!c.active ? 'inactive' : ''}`} 
                onClick={() => handleSelect(c)}
              >
                <img src={c.image} alt={c.name} className="campus-item-img" />
                <div className="campus-item-content">
                  <span className="campus-item-name">{c.name}</span>
                  {!c.active && <span className="coming-soon-badge">Coming Soon</span>}
                </div>
                {c.active && (
                  <svg className="campus-item-arrow" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
                  </svg>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CampusSelect;
