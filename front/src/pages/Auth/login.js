import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Lock } from "lucide-react";
import Logo from "./../../images/white-image.png";
import { useAuth } from './../../context/auth';


const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({ message: "", type: "" });
  const navigate = useNavigate();
  const [auth, setAuth]=useAuth();

  const validateForm = () => {
    let newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address.";
    }
    if (!formData.password.trim()) {
      newErrors.password = "Password is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const res = await axios.post("/api/v1/auth/login", formData);

        if (res && res.data.success) {
          // First update localStorage
        localStorage.setItem('auth', JSON.stringify(res.data));
        
        // Then update auth context
        setAuth({
          ...auth,
          user: res.data.user,
          token: res.data.token
        });
          setNotification({ message: res.data.message, type: "success" });
          setTimeout(() => {
            navigate("/");
          }, 2000);
        } 
        else {
          setNotification({ message: res.data.message, type: "danger" });
        }
      } catch (error) {
        setNotification({
          message: error.response?.data?.message || "Something went wrong!",
          type: "danger",
        });
      }
    }
  };

  return (
    <div className="container-fluid vh-100 d-flex align-items-center justify-content-center">
      <div className="row w-50 shadow-lg rounded bg-white">
        <div className="col-md-6 p-5">
          <h3 className="fw-bold text-center">Welcome Back!</h3>
          <h2 className="fw-bold text-center">Login</h2>
          {notification.message && (
            <div className={`alert alert-${notification.type} text-center`}>
              {notification.message}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <small className="text-danger">{errors.email}</small>}
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <div className="input-group">
                <input
                  type="password"
                  className="form-control"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <span className="input-group-text"><Lock size={18} /></span>
              </div>
              {errors.password && <small className="text-danger">{errors.password}</small>}
            </div>
            <button type="submit" className="btn btn-dark w-100" style={{ fontWeight: "normal" }} onMouseEnter={(e) => e.target.style.fontWeight = "bold"} onMouseLeave={(e) => e.target.style.fontWeight = "normal"}>Login</button>
          </form>
          <p className="mt-3 text-center">
            Don't have an Account? <Link to="/signup" className="text-black text-decoration-none" style={{ fontWeight: "normal" }} onMouseEnter={(e) => e.target.style.fontWeight = "bold"} onMouseLeave={(e) => e.target.style.fontWeight = "normal"}>Sign Up</Link>
          </p>
          <p className="mt-3 text-center">
            Forgot Password? <Link to="/forgot-password" className="text-black text-decoration-none" style={{ fontWeight: "normal" }} onMouseEnter={(e) => e.target.style.fontWeight = "bold"} onMouseLeave={(e) => e.target.style.fontWeight = "normal"}>Reset Password</Link>
          </p>
        </div>
        <div className="col-md-6 d-flex align-items-center justify-content-center p-5">
          <img src={Logo} alt="Login Illustration" className="img-fluid" />
        </div>
      </div>
    </div>
  );
};

export default Login;