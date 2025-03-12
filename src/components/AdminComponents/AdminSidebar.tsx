import React from "react";
import { useAuth } from "../../context/AuthContext";
import "../../Styles/AdminSidebar.css"; // Sidebar-specific styles

interface AdminSidebarProps {
  activePanel: string;
  setActivePanel: (panel: "add" | "schedule") => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activePanel, setActivePanel }) => {
  const { logout } = useAuth();

  return (
    <nav className="admin-sidebar">
      <h2>🚛 Admin Panel</h2>

      <button className={`sidebar-btn ${activePanel === "add" ? "active" : ""}`} onClick={() => setActivePanel("add")}>
        ➕ Add Food Truck
      </button>

      <button className={`sidebar-btn ${activePanel === "schedule" ? "active" : ""}`} onClick={() => setActivePanel("schedule")}>
        📅 Set Schedule
      </button>

      <button className="logout-btn" onClick={() => logout()}>
        🚪 Logout
      </button>
    </nav>
  );
};

export default AdminSidebar;
