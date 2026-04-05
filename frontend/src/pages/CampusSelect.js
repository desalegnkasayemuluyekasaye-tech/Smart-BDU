import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import campusMain from "../assets/campus-main.jpg";
import campusZen  from "../assets/campus-zen.jpg";
import campusTib  from "../assets/campus-tib.jpg";
import campusYib  from "../assets/campus-yib.jpg";
import polyCampus from "../assets/poly-campus-photo.png";

const campuses = [
  { id: "main",    name: "Main Campus (Peda)",  image: campusMain },
  { id: "bit",     name: "BIT / Poly Campus",   image: polyCampus },
  { id: "zen",     name: "Zenzelma Campus",      image: campusZen  },
  { id: "tibebe",  name: "Tibebe Ghion Campus",  image: campusTib  },
  { id: "yibab",   name: "Yibab Campus",         image: campusYib  },
];

const CampusSelect = () => {
  const navigate = useNavigate();

  const handleSelect = (campus) => {
    if (campus.id !== "bit") {
      toast.info("Coming Soon! This campus will be available shortly.", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }
    navigate("/login", { state: { campus } });
  };

  return (
    <div className="campus-wrapper">
      <div className="campus-card-box">
        <div className="campus-logo-wrap">
          <img src="/logo.png" alt="SmartBDU" className="campus-logo-img" />
        </div>
        <p className="campus-subtitle">Select Your Campus</p>

        <ul className="campus-list">
          {campuses.map((c) => (
            <li key={c.id}>
              <button className="campus-item" onClick={() => handleSelect(c)}>
                <img src={c.image} alt={c.name} className="campus-item-img" />
                <span className="campus-item-name">{c.name}</span>
                <svg className="campus-item-arrow" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
                </svg>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CampusSelect;
