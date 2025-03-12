import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout(() => navigate("/login")); // ✅ Call navigate after logout
  };

  return (
    <div>
      <nav className="navbar">
        <button onClick={handleLogout}>Logout</button>
      </nav>
      <Outlet /> {/* Renders child routes */}
    </div>
  );
};

export default Layout;
