import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, signInAnonymously, User } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import useAPI from "../hooks/useAPI";
import LoadingOverlay from "../components/LoadingOverlay";
import { createOrUpdateUser } from "../utils/CreateOrUpdateUser"; // ✅ make sure this file exists

interface AuthContextType {
  user: User | null;
  role: string | null;
  loading: boolean;
  called: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(localStorage.getItem("role") || null);
  const [loading, setLoading] = useState<boolean>(true);
  const [called, setCalled] = useState<boolean>(false);
  const navigate = useNavigate();
  const { callApi } = useAPI<{ role: string }>();

  useEffect(() => {
    setLoading(true);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        try {
          const idToken = await firebaseUser.getIdToken();
          const response = await callApi("getUserRole", "POST", { token: idToken }, {}, false);

          if (response.success && response.data?.role) {
            setRole(response.data.role);
            localStorage.setItem("role", response.data.role);

            // ✅ Merge anonymous favorites if anonUid is stored
            const anonUid = localStorage.getItem("anonUid");
            await createOrUpdateUser(anonUid, response.data.role);
            localStorage.removeItem("anonUid");

            // Redirect logic
            if (window.location.pathname === "/login") {
              if (response.data.role === "admin") {
                navigate("/admin", { replace: true });
              } else if (response.data.role === "food_truck_owner") {
                navigate("/setmytruck", { replace: true });
              } else {
                navigate("/", { replace: true });
              }
            }
          } else {
            setRole(null);
            await createOrUpdateUser(null); // fallback - should still exist
          }
        } catch (err) {
          console.error("Error fetching role or updating user:", err);
          setRole(null);
        }

        setLoading(false);
        setCalled(true);
      } else {
        // Try anonymous sign-in
        try {
          const anonUser = await signInAnonymously(auth);
          setUser(anonUser.user);
          localStorage.setItem("anonUid", anonUser.user.uid);
          await createOrUpdateUser(null); // Create anon user
        } catch (err) {
          console.error("Anonymous sign-in failed:", err);
        } finally {
          setLoading(false);
          setCalled(true);
        }
      }
    });

    return () => unsubscribe();
  }, [callApi, navigate]);

  const logout = async () => {
    await auth.signOut();
    setUser(null);
    setRole(null);
    localStorage.removeItem("role");
    navigate("/login", { replace: true });
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, called, logout }}>
      {loading && !called ? <LoadingOverlay /> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
