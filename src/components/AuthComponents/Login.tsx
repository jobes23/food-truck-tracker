import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { toast } from "react-toastify";
import useAPI from "../../hooks/useAPI";
import LoadingOverlay from "../LoadingOverlay";
import AuthLayout from "../AuthLayout";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { callApi } = useAPI<{ role: string }>();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      const response = await callApi("getUserRole", "POST", { token: idToken }, {}, false);

      if (!response.success || !response.data?.role) {
        toast.error("Unable to determine user role.");
        return;
      }

      localStorage.setItem("role", response.data.role);
      toast.success("🎉 Welcome back!");

      const role = response.data.role;
      if (role === "admin") navigate("/admin");
      else if (role === "food_truck_owner") navigate("/setmytruck");
      else navigate("/");
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        toast.error("No account found for that email.");
      } else if (err.code === "auth/wrong-password") {
        toast.error("Incorrect password.");
      } else if (err.code === "auth/invalid-email") {
        toast.error("Please enter a valid email.");
      } else {
        toast.error("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {loading && <LoadingOverlay />}
      <form className="auth-form" onSubmit={handleLogin}>
        <h2>Welcome Back</h2>
        <label htmlFor="email">Email Address:</label>
        <input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password">Password:</label>
        <input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="link mt-4">
          <Link to="/signup">Don't have an account? Sign Up</Link><br />
          <Link to="/forgot-password">Forgot your password?</Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;
