// src/components/AuthLayout.tsx
import React from "react";
import "../Styles/AuthLayout.css";

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="auth-layout">
      <div className="auth-box">
        <div className="auth-header">
          <h1>🍴 Foodie Finder</h1>
        </div>
        <div className="auth-content">{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;
