import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { Sun, Moon } from 'lucide-react';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(true);

  const bgColor = isDark ? 'black' : 'white';
  const textColor = isDark ? 'white' : 'black';
  const subTextColor = isDark ? '#cccccc' : '#333333';
  const btnPrimary = isDark ? 'btn-primary' : 'btn-dark';
  const btnOutline = isDark ? 'btn-outline-primary' : 'btn-outline-dark';
  const borderStyle = isDark ? { borderColor: 'white' } : { borderColor: 'black' };

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center vh-100 text-center position-relative"
      style={{ backgroundColor: bgColor, transition: 'background 0.3s' }}
    >
      {/* Theme toggle button - circular icon */}
      <button
        className="position-absolute top-0 end-0 m-3 d-flex align-items-center justify-content-center"
        style={{
          zIndex: 10,
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: isDark ? '#222' : '#f0f0f0',
          border: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
          transition: 'background 0.3s',
          color: isDark ? '#ffd700' : '#333',
          cursor: 'pointer',
        }}
        onClick={() => setIsDark((prev) => !prev)}
        aria-label="Toggle background"
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        onMouseOver={e => e.currentTarget.style.background = isDark ? '#333' : '#e0e0e0'}
        onMouseOut={e => e.currentTarget.style.background = isDark ? '#222' : '#f0f0f0'}
      >
        {isDark ? <Sun size={22} color="#ffd700" /> : <Moon size={22} color="#333" />}
      </button>
      <h1 className="display-1 fw-bold notfound-404" style={{ color: textColor }}>404</h1>
      <h2 className="fs-3 fw-semibold mt-3 notfound-title" style={{ color: textColor }}>Page Not Found</h2>
      <p className="mt-2" style={{ color: subTextColor }}>Something went wrong, this page is broken.</p>
      <div className="mt-4 d-flex gap-3 notfound-btns">
        <button
          className={`btn px-4 py-2 ${btnPrimary}`}
          style={{ color: isDark ? 'white' : 'white' }}
          onClick={() => navigate('/')}
        >
          Return to homepage
        </button>
        <button
          className={`btn px-4 py-2 ${btnOutline}`}
          style={{ ...borderStyle, color: textColor }}
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
