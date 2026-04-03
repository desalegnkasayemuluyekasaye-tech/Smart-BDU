import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import bdu1 from "../assets/bdu1.jpg";
import bdu2 from "../assets/images.jpg";

const slides = [bdu1, bdu2];

const Home = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const scrollTo = (id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="home-wrapper">

      {/* ===== NAVBAR ===== */}
      <nav className="home-nav">
        <div className="nav-brand">Smart<span>BDU</span></div>

        <button
          className={`hamburger ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul className={`nav-links ${menuOpen ? "nav-links--open" : ""}`}>
          <li><Link to="/" className="nav-link-item" onClick={() => setMenuOpen(false)}>Home</Link></li>
          <li><button className="nav-link-item nav-link-anchor" onClick={() => scrollTo("about")}>About</button></li>
          <li><button className="nav-link-item nav-link-anchor" onClick={() => scrollTo("contact")}>Contact</button></li>
          <li><Link to="/campus" className="nav-link-btn" onClick={() => setMenuOpen(false)}>Login</Link></li>
        </ul>
      </nav>

      {/* ===== HERO ===== */}
      <section className="hero-fullscreen">
        {slides.map((img, i) => (
          <div
            key={i}
            className={`hero-bg-anim ${i === current ? "hero-bg-active" : ""}`}
            style={{ backgroundImage: `url(${img})` }}
          ></div>
        ))}
        <div className="hero-overlay"></div>
        <div className="hero-center">
          <h1 className="hero-title">Welcome to <span className="hero-accent">Smart BDU</span></h1>
          <p className="hero-subtitle">Your all-in-one university platform</p>
          <Link to="/campus" className="get-started-btn">Get Started</Link>
        </div>
        <div className="slide-dots">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`slide-dot ${i === current ? "slide-dot-active" : ""}`}
              onClick={() => setCurrent(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ===== ABOUT SECTION ===== */}
      <section className="about-section" id="about">
        <div className="about-image-wrap">
          <img
            src="https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?auto=format&fit=crop&w=800&q=80"
            alt="Bahir Dar University"
            className="about-image"
          />
        </div>
        <div className="about-content">
          <div className="section-label">About Us</div>
          <h2 className="about-title">Bahir Dar University</h2>
          <p className="about-text">
            Bahir Dar University (BDU) is one of Ethiopia's leading public universities, located in the scenic city of Bahir Dar on the shores of Lake Tana — the source of the Blue Nile.
          </p>
          <p className="about-text">
            Founded in 1963, BDU has grown into a comprehensive research and teaching institution with over 20,000 students, 800 academic staff, and more than 100 undergraduate and postgraduate programs across science, technology, humanities, and social sciences.
          </p>
          <p className="about-text">
            Smart BDU is the university's digital platform — designed to streamline academic life by bringing schedules, courses, announcements, campus services, and AI-powered assistance into one place.
          </p>
          <div className="about-stats">
            <div className="about-stat">
              <span className="about-stat-num">1963</span>
              <span className="about-stat-lbl">Founded</span>
            </div>
            <div className="about-stat">
              <span className="about-stat-num">20K+</span>
              <span className="about-stat-lbl">Students</span>
            </div>
            <div className="about-stat">
              <span className="about-stat-num">100+</span>
              <span className="about-stat-lbl">Programs</span>
            </div>
            <div className="about-stat">
              <span className="about-stat-num">50+</span>
              <span className="about-stat-lbl">Departments</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="home-footer" id="contact">
        <div className="footer-top">

          <div className="footer-col">
            <div className="footer-brand">Smart<span>BDU</span></div>
            <p className="footer-tagline">Empowering students at<br />Bahir Dar University</p>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-title">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/" className="footer-link">Home</Link></li>
              <li><button className="footer-link footer-link-btn" onClick={() => scrollTo("about")}>About</button></li>
              <li><button className="footer-link footer-link-btn" onClick={() => scrollTo("contact")}>Contact</button></li>
              <li><Link to="/login" className="footer-link">Login</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-title">Contact Us</h4>
            <ul className="footer-contact-list">
              <li>
                <a href="mailto:info@smartbdu.edu.et" className="footer-contact-item">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="footer-icon"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/></svg>
                  info@smartbdu.edu.et
                </a>
              </li>
              <li>
                <a href="tel:+251582205942" className="footer-contact-item">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="footer-icon"><path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.58a1 1 0 0 1-.25 1.01l-2.2 2.2z"/></svg>
                  +251 58 220 5942
                </a>
              </li>
              <li>
                <a href="https://maps.google.com/?q=Bahir+Dar+University" target="_blank" rel="noopener noreferrer" className="footer-contact-item">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="footer-icon"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                  Bahir Dar, Ethiopia
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-title">Follow Us</h4>
            <div className="social-icons">
              <a href="https://t.me/smartbdu" target="_blank" rel="noopener noreferrer" className="social-icon-btn" aria-label="Telegram">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.17 13.67l-2.94-.918c-.64-.203-.658-.64.135-.954l11.57-4.461c.537-.194 1.006.131.959.884z"/></svg>
              </a>
              <a href="https://linkedin.com/company/smartbdu" target="_blank" rel="noopener noreferrer" className="social-icon-btn" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a href="https://facebook.com/smartbdu" target="_blank" rel="noopener noreferrer" className="social-icon-btn" aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
              </a>
              <a href="https://twitter.com/smartbdu" target="_blank" rel="noopener noreferrer" className="social-icon-btn" aria-label="Twitter / X">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            </div>
          </div>

        </div>

        <div className="footer-bottom">
          <p className="footer-copy">© {new Date().getFullYear()} Smart BDU. All rights reserved.</p>
        </div>
      </footer>

    </main>
  );
};

export default Home;
