import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Map from "./components/Map";
import Login from "./components/Login";
import Signup from "./components/SignUp";
import AdminPanel from "./components/AdminPanel";
import LoadingOverlay from "./components/LoadingOverlay";
import ResetPassword from "./components/ResetPassword";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

// const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const { user, role, loading } = useAuth();

//   if (loading) return <LoadingOverlay />;
//   if (!user || !role) return <Navigate to="/login" replace />;

//   return children;
// };

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, role, loading } = useAuth();

  if (loading) return <LoadingOverlay />; // Ensure loading state is handled properly
  if (!user) return <Navigate to="/login" replace />;
  if (role !== "admin") return <Navigate to="/" replace />; // Redirect to home if not admin

  return children;
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider> {/* ✅ Moved inside <Router> */}
        <Routes>
          <Route path="/" element={<Map />} />
          <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
        <ToastContainer />
      </AuthProvider>
    </Router>
  );
};

export default App;
