import React, { useState } from "react";
import AddFoodTruck from "./AdminComponents/AddFoodTruck";
import ScheduleFoodTruck from "./PanelComponents/ScheduleFoodTruck";
import AdminSidebar from "./AdminComponents/AdminSidebar";
import "../Styles/AdminPanel.css"; // Ensure styling remains consistent

const AdminPanel: React.FC = () => {
  const [activePanel, setActivePanel] = useState<"add" | "schedule">("add");

  return (
    <div className="admin-content">
      <AdminSidebar activePanel={activePanel} setActivePanel={setActivePanel} />

      <div className="admin-panel">
        <div className="card">
          {activePanel === "add" ? <AddFoodTruck /> : <ScheduleFoodTruck />}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
