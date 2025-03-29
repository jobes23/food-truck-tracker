import React, { useState } from "react";
import AddFoodTruck from "./AdminComponents/AddFoodTruck";
import ScheduleFoodTruck from "./PanelComponents/ScheduleFoodTruck";
import AdminSidebar from "./AdminComponents/AdminSidebar";
import AddSponsor from "./SponsorComponents/AddSponsor";
import ScheduleSponsor from "./SponsorComponents/ScheduleSponsor";
import "../Styles/AdminPanel.css";

const AdminPanel: React.FC = () => {
  const [activePanel, setActivePanel] = useState<
    "add" | "schedule" | "addSponsor" | "scheduleSponsor"
  >("add");

  return (
    <div className="admin-content">
      <AdminSidebar activePanel={activePanel} setActivePanel={setActivePanel} />

      <div className="admin-panel">
        <div className="card">
          {activePanel === "add" && <AddFoodTruck />}
          {activePanel === "schedule" && <ScheduleFoodTruck />}
          {activePanel === "addSponsor" && <AddSponsor />}
          {activePanel === "scheduleSponsor" && <ScheduleSponsor />}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
