import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { toast } from "react-toastify";
import useAPI from "../hooks/useAPI";
import "../Styles/Login.css";
import LoadingOverlay from "./LoadingOverlay"; // ✅ Import Loading Screen

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // ✅ Loading state
  const navigate = useNavigate();
  const { callApi } = useAPI<{ role: string }>();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true); // ✅ Show loading screen

    try {
      // ✅ Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();

      // ✅ Fetch User Role from Backend
      const response = await callApi("getUserRole", "POST", { token: idToken }, {}, false);

      if (!response.success || !response.data) {
        setError("Failed to fetch user role");
        setLoading(false);
        return;
      }

      localStorage.setItem("role", response.data.role);

      // ✅ Redirect Based on Role (Ensure navigation occurs AFTER state updates)
      if (response.data.role === "admin") {
        toast.success("Login successful! Redirecting...");
        setTimeout(() => navigate("/admin", { replace: true }), 500); // ✅ Delay to ensure state update
      } else if (response.data.role === "food_truck_owner") {
        toast.success("Login successful! Redirecting...");
        setTimeout(() => navigate("/setmytruck", { replace: true }), 500);
      } else {
        setError("Unauthorized role");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message);
      toast.error("Login failed. Please check your credentials.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {loading && <LoadingOverlay />} {/* ✅ Show loading overlay */}
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <form onSubmit={handleLogin} className="flex flex-col w-80 p-4 border rounded-lg shadow-md">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-3 p-2 border rounded"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-3 p-2 border rounded"
          required
        />
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
