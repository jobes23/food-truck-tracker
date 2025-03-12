import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import useAPI from "../hooks/useAPI";
import LoadingOverlay from "../components/LoadingOverlay"; // ✅ Import loading overlay

interface AuthContextType {
  user: User | null;
  role: string | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(localStorage.getItem("role") || null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { callApi } = useAPI<{ role: string }>();

  useEffect(() => {
    setLoading(true);
  
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
  
      if (firebaseUser) {
        const idToken = await firebaseUser.getIdToken();
        const response = await callApi("getUserRole", "POST", { token: idToken }, {}, false);
  
        if (response.success && response.data) {
          setRole(response.data.role);
          localStorage.setItem("role", response.data.role);
  
          // ✅ Redirect only if the user is currently at login
          if (window.location.pathname === "/login") {
            if (response.data.role === "admin") {
              navigate("/admin", { replace: true });
            } else if (response.data.role === "food_truck_owner") {
              navigate("/setmytruck", { replace: true });
            } else {
              navigate("/", { replace: true }); // Fallback for other roles
            }
          }
        } else {
          setRole(null);
        }
      } else {
        setRole(null);
      }
  
      setLoading(false);
    });
  
    return () => unsubscribe();
  }, [callApi, navigate]);  

  // ✅ Logout Function
  const logout = async () => {
    await auth.signOut();
    setUser(null);
    setRole(null);
    localStorage.removeItem("role");
    navigate("/login", { replace: true });
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, logout }}>
      {loading ? <LoadingOverlay /> : children} {/* ✅ Show overlay while loading */}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
