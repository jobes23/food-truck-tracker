import React from "react";
import "../Styles/LoadingOverlay.css";

const LoadingOverlay: React.FC = () => {
  return (
    <div className="loading-overlay">
      <div className="loading-truck-container">
        <div className="loading-truck">🚚</div>
      </div>
      <p className="loading-text">Cooking Up the Best Food Trucks Near You...</p>
    </div>
  );
};

export default LoadingOverlay;
