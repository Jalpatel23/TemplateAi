import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
      <div className="d-flex flex-column align-items-center justify-content-center vh-100 text-center" style={{ backgroundColor: 'black' }}>
        <h1 className="display-1 fw-bold notfound-404 text-white">404</h1>
        <h2 className="fs-3 fw-semibold mt-3 notfound-title text-white">Page Not Found</h2>
        <p className="mt-2" style={{ color: '#cccccc' }}>Something went wrong, this page is broken.</p>
        <div className="mt-4 d-flex gap-3 notfound-btns">
          <button className="btn btn-primary px-4 py-2" onClick={() => navigate('/')}>Return to homepage</button>
          <button className="btn btn-outline-primary px-4 py-2" style={{ borderColor: 'white' }} onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
  );
};

export default NotFoundPage;
